import {getVacationApi} from './vacations';

declare const __VACATION_KEY__: string;

export interface UserProps {
	id: number;
	icon: URL  | null;
	name: string;
	email: string | null;
	groups: string[] | null;
	vacations: String[] | null
}

export interface UsersGroupProps {
	groups: string[],
	users: {[key: string]: UserProps},
}

export const getUserGroupApi = async(userId: string) =>  {
	const url = '/jira/rest/api/2/user?expand=groups&accountId=' + userId;
	const groups: string[] = [];
	const paramaters = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	let response = await fetch(url, paramaters)
	const ajax_result = await response.json();
	if (ajax_result && ajax_result.groups && ajax_result.groups.items) {
		ajax_result.groups.items.forEach((group: any) => {
			let name = group.name;
			if (!name.match(/(^org|jira|atlassian)/i)) {
				groups.push(group.name);
			}
		});
	}
	return groups;
}

const getUserDataFromAjaxResponse = (user: any) => {
	if (!user || !user.displayName) {
		return null;
	}
	const return_obj: UserProps = {
		id: user.accountId,
		icon: user.avatarUrls ? user.avatarUrls['16x16'] : null,
		name: user.displayName,
		email: user.emailAddress,
		groups: [],
		vacations: [],
	}
	return return_obj;
};

export const getUsersAndGroupsApi = async() =>  {
	const max_results = 1000;
	const main_url = '/jira/rest/api/2/user/search?query=.&maxResults=' + max_results + '&expand=groups,applicationRoles';
	// let result: TicketProps[] = [];
	const paramaters = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	let last = false;
	let start_at = 0;
	let results: {[key: string]: UserProps} = {};
	let groups: string[] = [];
	let vacations: {[key: string]: string[]} = {};
	await getVacationApi().then(data => {
		vacations = data;
	});

	while(!last) {
		let url = main_url + '&startAt=' + start_at;
		let response = await fetch(url, paramaters)
		const ajax_result = await response.json();
		if (ajax_result.length) {
			for(const user of ajax_result) {
			// ajax_result.forEach((user: any) => {
				if(user.accountType != 'app') {
					let formatted: UserProps | null = getUserDataFromAjaxResponse(user);
					if (formatted != null) {
						await getUserGroupApi(user.accountId).then(data => {
							groups = [...new Set(groups.concat(data))];
							formatted.groups = data;
						});
						
						let vacation_key: string | null = formatted.name;
						if (__VACATION_KEY__ == 'email') {
							vacation_key = formatted.email;
						}
						if (vacation_key && vacations[vacation_key]) {
							formatted.vacations = vacations[vacation_key];
						}
						results[formatted.id] = formatted;
					}
				}
			};
			start_at += max_results;
		} else {
			last = true;
		}
	}
	return {
		groups: groups,
		users: results,
	};
}
