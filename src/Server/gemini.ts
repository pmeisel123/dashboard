import { GoogleGenAI } from "@google/genai";
import type { IncomingMessage } from "node:http";
import type { HolidayProps, TicketProps, UserProps } from "../src/Api/Types";
import { loadConfig } from "./config";

export const GetGeminiData = async (req: IncomingMessage, requestBody: string | null) => {
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
					...ticket,
					timeestimate: ticket.timeestimate ?? (ticket.is_epic ? 0 : defaultEstimate),
				};
				return acc;
			},
			{} as Record<string, TicketProps>,
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
	  - US Bank Holidays: ${JSON.stringify(holidays)}
	  
	  Return response strictly adhering to the mandated structured schema. Provide a detailed breakdown showing when base tasks finish, how the padding work was divided among active users, and what bottlenecks (vacations/holidays) shifted the final date inside the reasoning field.
	`;

		let last_error: any = "";
		let foundResponse = false;

		const geminiModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];

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
						return JSON.stringify({ response: JSON.parse(responseText), modelUsed: model });
					} catch (error) {
						last_error = error;
						console.error(`Failed processing Gemini request with model ${model}:`, error);
					}
				}
			}
		}

		return JSON.stringify({ error: last_error?.message || last_error });
	}

	return false;
};
