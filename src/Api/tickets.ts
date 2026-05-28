// https://github.com/pmeisel123/dashboard/blob/main/src/Api/tickets.ts
import type { ConfigProps, CustomFieldsFromJiraProps, TicketProps } from "./Types";

const getNameFromPerson = (person: any): string | null => {
	return person?.displayName ?? null;
};
const getIdFromPerson = (person: any): string | null => {
	return person?.accountId ?? null;
};

const convertEstimateToDays = (estimate?: number | null): number | null => {
	if (typeof estimate === "number" && !isNaN(estimate)) {
		// Default Jira assumes 8 hours in a day
		return estimate / (60 * 60 * 8);
	}
	return null;
};

const ticketFromIssue = (issue: any, config: ConfigProps): TicketProps | null => {
	if (!issue?.fields) return null;

	const fields = issue.fields;
	const id: number = issue.id;
	const key: string = issue.key;
	const assignee: string | null = getNameFromPerson(fields.assignee);
	const assignee_id: string | null = getIdFromPerson(fields.assignee);
	const creator: string | null = getNameFromPerson(fields.creator);
	const status: string | null = fields.status?.name ?? null;
	const summary: string | null = fields.summary ?? null;
	const created: any = fields.created ?? null;
	const updated: any = fields.updated ?? null;
	const is_epic: boolean = fields.issuetype?.name === "Epic";
	console.log(fields.issuetype);
	let timeestimate: number | null = fields.timeestimate ?? null;
	let timeoriginalestimate: number | null = fields.timeoriginalestimate ?? null;
	let timespent: number | null = fields.timespent ?? null;
	const blocks: string[] = [];
	const blocked_by: string[] = [];

	for (const link of fields.issuelinks ?? []) {
		if (link?.type?.name === "Blocks") {
			if (link.inwardIssue?.key) blocked_by.push(link.inwardIssue.key);
			if (link.outwardIssue?.key) blocks.push(link.outwardIssue.key);
		}
	}

	let parentkey: string | null = null;
	let parentname: string | null = null;
	const labels: string[] = Array.isArray(fields.labels) ? fields.labels : [];
	const isdone: boolean = !!status && Array.isArray(config.DONE_STATUS) && config.DONE_STATUS.includes(status);
	if (isdone) {
		timeestimate = 0;
	}
	if (fields.parent) {
		parentkey = fields.parent.key ?? null;
		parentname = fields.parent.fields?.summary ?? null;
	}

	const custom_fields: { [key: string]: any } = {};
	if (config.CUSTOM_FIELDS) {
		for (const custom_field_key of Object.keys(config.CUSTOM_FIELDS)) {
			const def = config.CUSTOM_FIELDS[custom_field_key];
			const rawVal = fields[custom_field_key];
			if (def?.Type === "User") {
				// Jira can return a single user object or an array for multi-user custom fields
				if (Array.isArray(rawVal)) {
					custom_fields[custom_field_key] = rawVal.map((user: any) => getNameFromPerson(user));
				} else if (rawVal) {
					custom_fields[custom_field_key] = getNameFromPerson(rawVal);
				} else {
					custom_fields[custom_field_key] = null;
				}
			} else {
				let custom_field_value: any = rawVal ?? "";
				if (typeof custom_field_value === "object" && custom_field_value != null) {
					custom_field_value = custom_field_value.name ?? String(custom_field_value);
				}
				custom_fields[custom_field_key] = custom_field_value;
			}
		}
	}

	return {
		id: id,
		key: key,
		assignee: assignee,
		assignee_id: assignee_id,
		creator: creator,
		status: status,
		summary: summary,
		created: created,
		updated: updated,
		timeestimate: convertEstimateToDays(timeestimate),
		timeoriginalestimate: convertEstimateToDays(timeoriginalestimate),
		timespent: convertEstimateToDays(timespent),
		parentkey: parentkey,
		parentname: parentname,
		isdone: isdone,
		labels: labels,
		customFields: custom_fields,
		blocks: blocks,
		blocked_by: blocked_by,
		is_epic: is_epic,
		child_keys: [],
		parent_in_results: false,
	};
};

export const getTicketsApi = async (search: string, config: ConfigProps): Promise<{ [key: string]: TicketProps }> => {
	const extraFieldsArray = config.CUSTOM_FIELDS ? Object.keys(config.CUSTOM_FIELDS) : [];
	const extra_fields = extraFieldsArray.length ? `${extraFieldsArray.join(",")},` : "";
	const main_url =
		"/jira/rest/api/3/search/jql?maxResults=5000&validateQuery=1&fields=" +
		extra_fields +
		"key,assignee,creator,status,summary,updated,created,parent,timeoriginalestimate,timeestimate,timespent,labels,issuelinks,issuetype&jql=" +
		encodeURIComponent(search);

	let last = false;
	const result: { [key: string]: TicketProps } = {};
	let url = main_url;
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const parentToChildrenMap: { [key: string]: string[] } = {};
	while (!last) {
		const response = await fetch(url, options);
		const ajax_result: any = await response.json();
		if (ajax_result?.issues) {
			for (const issue of ajax_result.issues) {
				const ticket = ticketFromIssue(issue, config);
				if (ticket == null) {
					continue;
				}
				if (ticket.parentkey) {
					if (!parentToChildrenMap[ticket.parentkey]) {
						parentToChildrenMap[ticket.parentkey] = [];
					}
					parentToChildrenMap[ticket.parentkey].push(ticket.key);
				}
				result[ticket.key] = ticket;
			}
		}
		// If Jira-like pagination is being used via nextPageToken/isLast
		if (ajax_result?.isLast === false && ajax_result?.nextPageToken) {
			url = `${main_url}&nextPageToken=${ajax_result.nextPageToken}`;
		} else {
			last = true;
		}
	}

	for (const parentKey in parentToChildrenMap) {
		const children = parentToChildrenMap[parentKey];
		const parentTicket = result[parentKey];
		if (parentTicket) {
			parentTicket.child_keys.push(...children);
			children.forEach((childKey) => {
				const childTicket = result[childKey];
				childTicket.parent_in_results = true;
			});
		}
	}
	console.log(result);
	return result;
};

export const getCustomFieldsApi = async (): Promise<CustomFieldsFromJiraProps[]> => {
	const url = "/jira/rest/api/3/field";
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const ajax_result: any[] = await response.json();
	return (ajax_result || [])
		.filter((record: any) => typeof record.key === "string" && record.key.startsWith("customfield_"))
		.map((record: any) => ({ Key: record.key, Name: record.name }));
};

const getEstimate = (
	tickets: { [key: string]: TicketProps },
	ticket: TicketProps,
	type: "timeestimate" | "timeoriginalestimate" | "timespent",
	defaultEstimate: number = 0,
) => {
	console.log("Calculating " + type + " for ticket " + ticket.key);
	if (type == "timespent") {
		return ticket.timespent || 0;
	}
	if (ticket.isdone && type == "timeestimate") {
		console.log(ticket.key + " is done, returning 0 for timeestimate");
		return 0;
	}
	const estimate = ticket[type];
	if (tickets[ticket.key].child_keys.length > 0) {
		if (estimate != null) {
			const children_estimate = getEstimations(tickets, defaultEstimate, 0, tickets[ticket.key].child_keys);
			let child_estimate = 0;
			if (type == "timeestimate") {
				child_estimate = children_estimate.totalTimEstimate;
			} else if (type == "timeoriginalestimate") {
				child_estimate = children_estimate.totalTimeOriginalEstimate;
			}
			console.log(
				ticket.key +
					" has children, parent estimate: " +
					estimate +
					", children combined estimate: " +
					child_estimate,
			);
			if (child_estimate < estimate) {
				return estimate - child_estimate;
			}
		}
		console.log(
			ticket.key +
				" has children but no parent estimate, returning 0 for parent and relying on children estimates",
		);
		return 0;
	}
	if (estimate != null) {
		console.log(ticket.key + " has no children, returning its own estimate of " + estimate);
		return estimate;
	}
	console.log(ticket.key + " has no estimate, returning default estimate of " + defaultEstimate);
	return defaultEstimate;
};

export const getEstimations = (
	tickets: { [key: string]: TicketProps },
	defaultEstimate: number = 0,
	estimatePadding: number = 0,
	childrenKeys: string[] = [],
): {
	totalTimEstimate: number;
	totalTimeOriginalEstimate: number;
	totalTimeSpent: number;
} => {
	console.log(
		"Calculating estimations for tickets: " +
			(childrenKeys.length ? childrenKeys.join(", ") : Object.keys(tickets).join(", ")),
	);
	if (Object.values(tickets).length === 0) {
		return { totalTimEstimate: estimatePadding, totalTimeOriginalEstimate: estimatePadding, totalTimeSpent: 0 };
	}
	const ticketKeys = childrenKeys.length > 0 ? childrenKeys : Object.keys(tickets);
	return ticketKeys.reduce(
		(acc, key) => {
			console.log("Processing ticket " + key);
			const ticket = tickets[key];
			acc.totalTimEstimate += getEstimate(tickets, ticket, "timeestimate", defaultEstimate);
			acc.totalTimeOriginalEstimate += getEstimate(tickets, ticket, "timeoriginalestimate", defaultEstimate);
			acc.totalTimeSpent += getEstimate(tickets, ticket, "timespent", defaultEstimate);
			return acc;
		},
		{ totalTimEstimate: estimatePadding, totalTimeOriginalEstimate: estimatePadding, totalTimeSpent: 0 },
	);
};
