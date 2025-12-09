import type { CustomFieldsProps, TicketProps } from "./Types";
declare const __DONE_STATUS__: string[];

declare const __CUSTOM_FIELDS__: { [key: string]: CustomFieldsProps };

function getNameFromPerson(person: any): string | null {
	if (person && person.displayName) {
		return person.displayName;
	}
	return null;
}
function getIdFromPerson(person: any): string | null {
	if (person && person.accountId) {
		return person.accountId;
	}
	return null;
}

function convertEstimateToDays(estimate: number | null): number | null {
	if (estimate !== null && typeof estimate !== "undefined") {
		// Default Jira assumes 8 hours in a day
		return estimate / (60 * 60 * 8);
	}
	return null;
}

function ticketFromIssue(issue: any): TicketProps | null {
	if (issue.fields) {
		let fields = issue.fields;
		let id: number = issue.id;
		let key: string = issue.key;
		let assignee: string | null = getNameFromPerson(fields.assignee);
		let assignee_id: string | null = getIdFromPerson(fields.assignee);
		let creator: string | null = getNameFromPerson(fields.creator);
		let status: string | null = null;
		if (fields.status) {
			status = fields.status.name;
		}
		let summary: string | null = fields.summary;
		let created: Date | null = fields.created;
		let updated: Date | null = fields.updated;
		let timeestimate: number | null = fields.timeestimate;
		let timeoriginalestimate: number | null = fields.timeoriginalestimate;
		let timespent: number | null = fields.timespent;
		let parentkey: string | null = null;
		let parentname: string | null = null;
		let isdone: boolean = !!status && __DONE_STATUS__.includes(status);
		if (isdone) {
			timeestimate = 0;
		}
		if (fields.parent) {
			parentkey = fields.parent.key;
			parentname = fields.parent.fields.summary;
		}
		let custom_fields: { [key: string]: string | null } = {};
		if (__CUSTOM_FIELDS__) {
			Object.keys(__CUSTOM_FIELDS__).forEach((custom_field_key) => {
				if (__CUSTOM_FIELDS__[custom_field_key].Type == "User") {
					if (fields[custom_field_key]) {
						custom_fields[custom_field_key] = fields[custom_field_key].map((user: any) =>
							getNameFromPerson(user),
						);
					}
				} else {
					let custom_field_value = fields[custom_field_key] || "";
					if (typeof custom_field_value == "object" && custom_field_value != null) {
						custom_field_value = fields[custom_field_key].name || "";
					}
					custom_fields[custom_field_key] = custom_field_value;
				}
			});
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
			customFields: custom_fields,
		};
	}
	return null;
}

export const getTicketsApi = async (search: string): Promise<TicketProps[]> => {
	let extra_fields = Object.keys(__CUSTOM_FIELDS__).join(",");
	if (extra_fields) {
		extra_fields += ",";
	}
	const main_url =
		"/jira/rest/api/3/search/jql?maxResults=5000&validateQuery=1&fields=" +
		extra_fields +
		"key,assignee,creator,status,summary,updated,created,parent,timeoriginalestimate,timeestimate,timespent&jql=" +
		encodeURI(search);
	let last = false;
	let result: TicketProps[] = [];
	let url = main_url;
	const paramaters = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	while (!last) {
		let response = await fetch(url, paramaters);
		const ajax_result: any = await response.json();
		if (ajax_result.issues) {
			ajax_result.issues.forEach(function (issue: any) {
				let ticket = ticketFromIssue(issue);
				if (ticket != null) {
					result.push(ticket);
				}
			});
		}
		if (ajax_result.nextPageToken && !ajax_result.isLast) {
			url = main_url + "&nextPageToken=" + ajax_result.nextPageToken;
			last = ajax_result.isLast;
		} else {
			last = true;
		}
	}
	return result;
};

export default function main() {}
