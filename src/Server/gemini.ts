import type { Schema } from "@google/genai";
import { GoogleGenAI, Type } from "@google/genai";
import { createHash } from "crypto";
import type { IncomingMessage } from "node:http";
import type { BranchCommit, HolidayProps, TicketProps, UserProps } from "../src/Api/Types";
import { loadConfig } from "./config";
interface CachedResponse {
	body: string;
	timestamp: number;
}

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
const DoAiRequest = async (prompt: string, config: ReturnType<typeof loadConfig>, structuredOutputSchema: any) => {
	const geminiModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
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
		Summarize as much as possible
		Commits: ${JSON.stringify(data)}
		`;
		console.log(prompt);
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
		const local_holidays: Record<string, HolidayProps> = Object.fromEntries(
			Object.entries(holidays)
				.filter(([_, holiday]) => holiday.bank)
				.map(([key, holiday]) => [
					key,
					{ name: holiday.name, date: holiday.date, type: holiday.type, bank: holiday.bank },
				]),
		);

		const prompt = `
			Today's date is ${new Date().toISOString().split("T")[0]}. Using the following project data, calculate a realistic project completion date.

			SCHEDULING RULES:
			1. Base Schedule: Map and schedule all active Jira Tickets based on user availability. Do not schedule work on weekends (Saturday/Sunday) or the provided US Bank Holidays. Suspend task progression for individual users during their specific vacation dates.
			2. Padding Task: Treat the provided "Estimate Padding" (${estimatePadding} days) as a single final task.
			3. Padding Resource Allocation: Once work on the padding begins, it can be split equally among all users who are currently active (not on vacation). Divide the remaining padding days by the total active workforce to calculate the final velocity.
			4. timeestimate: is the estimate in days.
			5. Parents estimate is greater than the sum of its children then include the difference as a separate task with the same parent, this task should be scheduled after all children are completed and before the padding task begins.
			6. If the remaining work, including padding, for a day is less than or equal to 0 the work is considered completed and should not be included in the remaining work calculations for subsequent days.
			7. Vacations each 1 full day. There are no ranges, just individual dates. If a user has a vacation on a given day, they cannot be assigned any work on that day and their portion of the padding task is effectively removed from the schedule for that day.

			WEEKLY WORK REMAINING BURNDOWN RECORDING:
			8. Generate a comprehensive timeline loop tracking the absolute cumulative remaining work (in total worker-days across all unfinished tasks and padding) at the end of each week.
			9. Construct a key-value hash representing this burndown metric. Each key must be the exact calendar date of that week's trailing Friday (formatted strictly as "YYYY-MM-DD") and the corresponding numeric value must be the remaining pool of effort units remaining after that Friday's schedule wraps up.

			DATA:
			- Jira Tickets: ${JSON.stringify(local_tickets)}
			- Assigned Users Vacations: ${JSON.stringify(userVacationSummary)}
			- Holidays: ${JSON.stringify(local_holidays)}
			Return response strictly adhering to the mandated structured schema. Provide a detailed breakdown showing when base tasks finish, how the padding work was divided among active users, and what bottlenecks (vacations/holidays) shifted the final date inside the reasoning field.
		`;

		const structuredOutputSchema = {
			type: "OBJECT",
			properties: {
				estimatedCompletionDate: {
					type: "STRING",
					description: "The estimated completion date of the project in YYYY-MM-DD format.",
				},
				howManyDaysOfWork: {
					type: "NUMBER",
					description: "Total calendar or worker effort days required to finish.",
				},
				dailyWorkRemaining: {
					type: "ARRAY",
					description:
						"A chronological timeline listing total remaining project workload at the end of each working day. Exclude weekends.",
					items: {
						type: "OBJECT",
						properties: {
							date: { type: "STRING", description: "The calendar date in YYYY-MM-DD format." },
							daysLeft: {
								type: "NUMBER",
								description: "The total remaining days of active work left across the project.",
							},
							whoIsWorking: {
								type: "ARRAY",
								description: "List of users working on that day.",
								items: { type: "STRING" },
							},
						},
						required: ["date", "daysLeft"],
					},
				},
				weeklyWorkRemaining: {
					type: "ARRAY",
					description:
						"A sequential timeline listing remaining workload totals at the close of every Friday.",
					items: {
						type: "OBJECT",
						properties: {
							date: {
								type: "STRING",
								description: "The Friday date of the work week ending in YYYY-MM-DD format.",
							},
							daysLeft: {
								type: "NUMBER",
								description: "The total remaining days of active work left across the project.",
							},
							howManyDaysOfWorkPerUser: {
								type: "OBJECT",
								description:
									"A key-value hash where each key is a user's name and the corresponding value is the number of days of work they have scheduled for that week.",
							},
						},
						required: ["date", "daysLeft"],
					},
				},
				reasoning: {
					type: "STRING",
					description: "Detailed breakdown of the schedule generation logic.",
				},
			},
			required: [
				"estimatedCompletionDate",
				"howManyDaysOfWork",
				"weeklyWorkRemaining",
				"dailyWorkRemaining",
				"reasoning",
			],
		};

		return await DoAiRequest(prompt, config, structuredOutputSchema);
	}

	return false;
};
