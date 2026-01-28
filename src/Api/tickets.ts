import type { ConfigProps, CustomFieldsFromJiraProps, TicketProps } from "./Types";

function getNameFromPerson(person: any): string | null {
	return person?.displayName ?? null;
}
function getIdFromPerson(person: any): string | null {
	return person?.accountId ?? null;
}

function convertEstimateToDays(estimate?: number | null): number | null {
	if (typeof estimate === "number" && !isNaN(estimate)) {
		// Default Jira assumes 8 hours in a day
		return estimate / (60 * 60 * 8);
	}
	return null;
}

function ticketFromIssue(issue: any, config: ConfigProps): TicketProps | null {
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
	};
}

export const getTicketsApi = async (search: string, config: ConfigProps): Promise<TicketProps[]> => {
	const extraFieldsArray = config.CUSTOM_FIELDS ? Object.keys(config.CUSTOM_FIELDS) : [];
	const extra_fields = extraFieldsArray.length ? `${extraFieldsArray.join(",")},` : "";
	const main_url =
		"/jira/rest/api/3/search/jql?maxResults=5000&validateQuery=1&fields=" +
		extra_fields +
		"key,assignee,creator,status,summary,updated,created,parent,timeoriginalestimate,timeestimate,timespent,labels,issuelinks&jql=" +
		encodeURIComponent(search);

	let last = false;
	const result: TicketProps[] = [];
	let url = main_url;
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	while (!last) {
		const response = await fetch(url, options);
		const ajax_result: any = await response.json();
		if (ajax_result?.issues) {
			for (const issue of ajax_result.issues) {
				const ticket = ticketFromIssue(issue, config);
				if (ticket != null) result.push(ticket);
			}
		}

		// If Jira-like pagination is being used via nextPageToken/isLast
		if (ajax_result?.isLast === false && ajax_result?.nextPageToken) {
			url = `${main_url}&nextPageToken=${ajax_result.nextPageToken}`;
		} else {
			last = true;
		}
	}
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
