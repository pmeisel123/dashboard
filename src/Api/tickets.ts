export interface SearchProps {
	search: string | null;
}

export interface TicketProps {
	id: number;
	key: string;
	assignee: string | null;
	creator: string | null;
	status: string | null;
	summary: string | null;
	created: Date | null;
	updated: Date | null;
	timeestimate: number | null;
	timeoriginalestimate: number | null;
	timespent: number | null;
	parentkey: string | null;
	parentname: string | null;
}

function getNameFromPerson(person: any): string | null {
	if (person && person.displayName) {
		return person.displayName;
	}
	return null;
}

function convertEstimateToDays(estimate: number | null): number | null {
	if (estimate !== null && typeof estimate !== 'undefined') {
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
		if (fields.parent) {
			parentkey = fields.parent.key;
			parentname = fields.parent.fields.summary;
		}
		return {
			'id': id,
			'key': key,
			'assignee': assignee,
			'creator': creator,
			'status': status,
			'summary': summary,
			'created': created,
			'updated': updated,
			'timeestimate': convertEstimateToDays(timeestimate) ,
			'timeoriginalestimate': convertEstimateToDays(timeoriginalestimate),
			'timespent': convertEstimateToDays(timespent),
			'parentkey': parentkey,
			'parentname': parentname,
		}
	}
	return null;
}

export const getTicketsApi = async(search: string ) =>  {
	const main_url = '/jira/rest/api/3/search/jql?maxResults=5000&validateQuery=1&fields=key,assignee,creator,status,summary,updated,created,parent,timeoriginalestimate,timeestimate,timespent&jql=' + encodeURI(search);
	let last = false;
	let result: TicketProps[] = [];
	let url = main_url;
	const paramaters = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		}
	};
	while(!last) {
		let response = await fetch(url, paramaters)
		const ajax_result = await response.json();
		if (ajax_result.issues) {
			ajax_result.issues.forEach(function(issue: any) {
				let ticket = ticketFromIssue(issue);
				if (ticket != null) {
					result.push( ticket );
				}
			});
		}
		if (ajax_result.nextPageToken && !ajax_result.isLast) {
			url = main_url + '&nextPageToken=' + ajax_result.nextPageToken;
			last = ajax_result.isLast;
		} else {
			last = true;
		}
	}
	return result;
}


export default function main() {}