import type { Schema } from "@google/genai";
import { GoogleGenAI, Type } from "@google/genai";
import { createHash } from "crypto";
import type { IncomingMessage } from "node:http";
import type { BranchCommit, HolidayProps, MessageProp, TicketProps, UserProps } from "../src/Api/Types";
import { loadConfig } from "./config";
interface CachedResponse {
	body: string;
	timestamp: number;
}

const geminiModels = [
	"gemini-3.5-flash",
	"gemini-3-flash",
	"gemini-3.1-flash-lite",
	"gemini-2.5-flash",
	"gemini-2.5-pro",
];
const apiResponseCache = new Map<string, CachedResponse>();
const apiRequestCache = new Map<string, number>();
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const structuredReleaseNotesOutputSchema: Schema = {
	type: Type.OBJECT,
	properties: {
		releaseNotes: {
			type: Type.OBJECT,
			properties: {
				version: {
					type: Type.STRING,
					description: "The version name or tag of the upcoming release.",
				},
				date: {
					type: Type.STRING,
					description: "The release date formatted as YYYY-MM-DD.",
				},
				sections: {
					type: Type.ARRAY,
					description: "Categorized changes included in this release version.",
					items: {
						type: Type.OBJECT,
						properties: {
							title: {
								type: Type.STRING,
								description: "The category title, e.g., 'New Features' or 'Improvements & Bug Fixes'.",
							},
							items: {
								type: Type.ARRAY,
								description: "Individual modification notes under this category.",
								items: {
									type: Type.OBJECT,
									properties: {
										ticket: {
											type: Type.STRING,
											description:
												"The Jira ticket key identifier (e.g., 'OPS-18'). If no ticket key exists for this item, you MUST omit this property key from the object completely.",
										},
										summary: {
											type: Type.STRING,
											description: "A brief, punchy summary title of the change.",
										},
										description: {
											type: Type.STRING,
											description:
												"Optional detailed description outlining the modification context.",
										},
									},
									required: ["summary"],
								},
							},
						},
						required: ["title", "items"],
					},
				},
			},
			required: ["version", "date", "sections"],
		},
	},
	required: ["releaseNotes"],
};
const structuredSlackOutputSchema: Schema = {
	type: Type.OBJECT,
	properties: {
		summary: {
			type: Type.STRING,
		},
	},
};

const DoAiRequest = async (prompt: string, config: ReturnType<typeof loadConfig>, structuredOutputSchema: any) => {
	const prompt_key = prompt ? createHash("sha256").update(prompt).digest("hex") : "no_prompt";

	if (apiRequestCache.has(prompt_key)) {
		let cachedRequestTimeStamp = apiRequestCache.get(prompt_key);
		// If there's an ongoing request for the same prompt, wait until it's done or until 5 minutes have passed
		while (
			apiRequestCache.has(prompt_key) &&
			cachedRequestTimeStamp &&
			Date.now() - cachedRequestTimeStamp < 60 * 5 * 1000
		) {
			cachedRequestTimeStamp = apiRequestCache.get(prompt_key);
			await sleep(1000);
		}
	}
	const cached = apiResponseCache.get(prompt_key);
	if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000 * 6) {
		// If cached response is less than 6 hour old, return it
		// In theory gemini responses should be the same for the same data
		console.log("Returning cached response for Gemini API");
		return cached.body;
	}

	console.log("Setting request cache for " + prompt_key);
	apiRequestCache.set(prompt_key, Date.now());

	let foundResponse = false;
	let last_error: any = "";
	for (let j = 0; j < config.GEMINI_API_KEYS.length; j++) {
		const key = config.GEMINI_API_KEYS[j];
		const ai = new GoogleGenAI({ apiKey: key });

		for (let i = 0; i < geminiModels.length; i++) {
			const model = geminiModels[i];
			if (!foundResponse) {
				try {
					const response = await ai.models.generateContent({
						model: model,
						contents: prompt,
						config: {
							responseMimeType: "application/json",
							responseSchema: structuredOutputSchema,
							temperature: 0,
						},
					});

					const responseText = response.text ?? "{}";
					foundResponse = true;
					const responseJson = JSON.stringify({ response: JSON.parse(responseText), modelUsed: model });
					const newCacheEntry: CachedResponse = {
						body: responseJson,
						timestamp: Date.now(),
					};
					apiResponseCache.set(prompt_key, newCacheEntry);
					apiRequestCache.delete(prompt_key);
					console.log("Deleting request cache for (pass) " + prompt_key);
					return responseJson;
				} catch (error) {
					last_error = error;
					console.error(`Failed processing Gemini request with model ${model}:`, error);
				}
			}
		}
	}
	console.log("Deleting request cache for (failed)" + prompt_key);
	apiRequestCache.delete(prompt_key);

	return JSON.stringify({ error: last_error?.message || last_error });
};

export const GetGeminiData = async (req: IncomingMessage, requestBody: string | null) => {
	console.log("Received Gemini API request", req.url);
	if (req.url === "/server/gemini/estimator") {
		return GetEstimatorData(req, requestBody);
	}
	if (req.url === "/server/gemini/releasenotes") {
		return GetReleaseNotes(req, requestBody);
	}
	if (req.url === "/server/gemini/slacksummary") {
		return GetSlackSummary(req, requestBody);
	}
	return JSON.stringify({ error: "Invalid endpoint" });
};

const GetReleaseNotes = async (req: IncomingMessage, requestBody: string | null) => {
	const config = loadConfig();
	if (req.method === "POST" && config.GEMINI_API_KEYS && requestBody) {
		const parsedBody = JSON.parse(requestBody);
		const { tickets, commits } = parsedBody as { tickets: { [key: string]: TicketProps }; commits: BranchCommit[] };
		const data: {
			sha: string;
			message: string;
			ticket: TicketProps | null;
			creator: string;
			date: string;
		}[] = [];
		commits.forEach((commit) => {
			const commit_creator = commit.creator;
			const commit_date = commit.date;
			const commit_message = commit.message;
			const commit_sha = commit.sha;
			const commit_ticket_id = commit.ticket;
			let ticket: TicketProps | null = null;
			if (commit_ticket_id && tickets[commit_ticket_id]) {
				ticket = tickets[commit_ticket_id];
			}
			data.push({
				sha: commit_sha,
				message: commit_message,
				creator: commit_creator,
				date: commit_date,
				ticket: ticket,
			});
		});
		const prompt = `
		Using the following commit and ticket data, generate release notes for the upcoming release.
		Summarize as much as possible, make readable for non technical people
		If there is a ticket associated with a commit, it should be the main reference for the release note, if not, use the commit message.
		Commits: ${JSON.stringify(data)}
		`;
		return await DoAiRequest(prompt, config, structuredReleaseNotesOutputSchema);
	}
};

const GetEstimatorData = async (req: IncomingMessage, requestBody: string | null) => {
	const config = loadConfig();
	if (req.method === "POST" && config.GEMINI_API_KEYS && requestBody) {
		const parsedBody = JSON.parse(requestBody);
		const { users, tickets, holidays, defaultEstimate, estimatePadding } = parsedBody as {
			users: UserProps[];
			tickets: { [key: string]: TicketProps };
			holidays: Record<string, HolidayProps>;
			defaultEstimate: number;
			estimatePadding: number;
		};

		// Sanitize the input
		const userVacationSummary = users.map((u: UserProps) => ({
			name: u.name,
			vacations: u.vacations,
		}));

		const local_tickets: { [key: string]: TicketProps } = Object.values(tickets).reduce(
			(acc, ticket) => {
				if (ticket.isdone === true) {
					return acc;
				}
				acc[ticket.key] = {
					id: ticket.id,
					key: ticket.key,
					assignee: ticket.assignee,
					assignee_id: ticket.assignee_id,
					creator: ticket.creator,
					status: ticket.status,
					summary: ticket.summary,
					created: ticket.created,
					updated: ticket.updated,
					timeestimate: ticket.timeestimate ?? (ticket.is_epic ? 0 : defaultEstimate),
					timeoriginalestimate: ticket.timeoriginalestimate,
					timespent: ticket.timespent,
					parentkey: ticket.parentkey,
					parentname: ticket.parentname,
					isdone: ticket.isdone,
					customFields: ticket.customFields,
					labels: ticket.labels,
					blocks: ticket.blocks,
					blocked_by: ticket.blocked_by,
					is_epic: ticket.is_epic,
					child_keys: ticket.child_keys,
					parent_in_results: ticket.parent_in_results,
					path: ticket.path,
				};
				return acc;
			},
			{} as Record<string, TicketProps>,
		);

		const local_holidays: Record<string, any> = Object.fromEntries(
			Object.entries(holidays)
				.filter(([_, holiday]) => holiday.bank)
				.map(([key, holiday]) => [key, { name: holiday.name, date: holiday.date }]),
		);

		const prompt = `
	Today's date is ${new Date().toISOString().split("T")[0]}.

	CRITICAL SYSTEM EXECUTIVE DIRECTIVE:
	You are an advanced project simulation engine. You are strictly forbidden from guessing or using division averages. Perform your day-by-day calculation engine execution internally, but only report the final state summaries at the close of each Friday to save output space.

	MANDATED SIMULATION RULES:
	1. Dynamic Pools: Identify all unique workers dynamically from the "Assigned Users Vacations" structure. 
	2. Dynamic Effort: Programmatically sum the "timeestimate" fields of all uncompleted tickets. If a parent ticket's estimate is greater than the sum of its children, include that difference as a trailing task before padding. Add the dynamic "Estimate Padding" (${estimatePadding} days) to calculate the absolute initial effort tracking pool.
	3. Sequential Blocker Logic: A ticket's remaining balance cannot be reduced if its key is present in an active "blocked_by" array of another uncompleted task. Assign active workers to unblocked tasks first.
	4. Weekly Matrix Aggregation: Loop chronologically day-by-day starting from Today's Date:
	   - On Saturdays, Sundays, and dates matching keys in the "Holidays" structure, zero effort is burned.
	   - On working weekdays, verify user vacation dates. If an individual user is on vacation, their velocity is 0. Otherwise, deduct 1 person-day from available unblocked work.
	   - Once base tasks hit 0, burn down padding by dividing the remaining effort equally among available active workers on that day.
	5. Termination State: Stop the simulation immediately on the calendar day the remaining work balance hits exactly 0. 

	DATA INGESTION VALUES:
	- Jira Tickets: ${JSON.stringify(local_tickets)}
	- Assigned Users Vacations: ${JSON.stringify(userVacationSummary)}
	- Holidays: ${JSON.stringify(local_holidays)}

	Return the finalized JSON object precisely adhering to the provided structural schema constraints. Keep the reasoning field concise.
	`;

		console.log("Generated prompt for Gemini API:", prompt);

		// Optimized schema removing daily tracking blocks
		const structuredOutputSchema = {
			type: "OBJECT",
			properties: {
				estimatedCompletionDate: {
					type: "STRING",
					description:
						"The absolute final project completion date calculated dynamically from the simulation in YYYY-MM-DD format.",
				},
				howManyDaysOfWork: {
					type: "NUMBER",
					description:
						"The total initial cumulative effort tracking pool days calculated dynamically by summing base tasks, parent deltas, and the padding task.",
				},
				weeklyWorkRemaining: {
					type: "ARRAY",
					description:
						"A sequential list tracking progress at the exact close of every work week's trailing Friday.",
					items: {
						type: "OBJECT",
						properties: {
							date: {
								type: "STRING",
								description: "The exact calendar date of the trailing Friday in YYYY-MM-DD format.",
							},
							daysLeft: {
								type: "NUMBER",
								description:
									"The total remaining pool of effort units remaining after this Friday's schedule wraps up.",
							},
							howManyDaysOfWorkPerUser: {
								type: "ARRAY",
								description:
									"An explicit breakdown of the specific active effort days contributed by each distinct worker during this single week chunk.",
								items: {
									type: "OBJECT",
									properties: {
										userName: {
											type: "STRING",
											description:
												"The full name of the resource identified dynamically from the data.",
										},
										daysWorkedThisWeek: {
											type: "NUMBER",
											description:
												"The exact numeric count of days this user was actively assigned work during this week (0 to 5).",
										},
									},
									required: ["userName", "daysWorkedThisWeek"],
								},
							},
						},
						required: ["date", "daysLeft", "howManyDaysOfWorkPerUser"],
					},
				},
				reasoning: {
					type: "STRING",
					description:
						"A concise summary text verifying the parsed task totals, listed blocking bottlenecks, and total vacation days processed.",
				},
			},
			required: ["estimatedCompletionDate", "howManyDaysOfWork", "weeklyWorkRemaining", "reasoning"],
		};

		return await DoAiRequest(prompt, config, structuredOutputSchema);
	}
};

const GetSlackSummary = async (req: IncomingMessage, requestBody: string | null) => {
	const config = loadConfig();
	if (req.method === "POST" && config.GEMINI_API_KEYS && requestBody) {
		const parsedBody = JSON.parse(requestBody);
		const data = parsedBody as MessageProp[];

		const prompt = `
		Using the following slack messages, generate a summary of the key points discussed in the conversation. Summarize as much as possible, make readable for non technical people
		Messages: ${JSON.stringify(data)}
		`;
		return await DoAiRequest(prompt, config, structuredSlackOutputSchema);
	}
};
