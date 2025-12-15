import type { WikiPageProps, WikiSpaceProps } from "./Types";

export const getWikiApi = async (id: string): Promise<WikiPageProps> => {
	const url = "/jira/wiki/rest/api/content/" + id + "?expand=body.view";
	const paramaters = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	let response = await fetch(url, paramaters);
	const ajax_result: any = await response.json();
	if (ajax_result && ajax_result.body) {
		return {
			title: ajax_result.title,
			body: ajax_result.body.view.value,
		};
	}
	return {
		title: "",
		body: "Not found",
	};
};

export const getWikiSpaces = async (): Promise<WikiSpaceProps[]> => {
	const main_url = "/jira/wiki/rest/api/space?limit=1000&expand=permissions";
	let last = false;
	let result: WikiSpaceProps[] = [];
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

		if (ajax_result.results) {
			ajax_result.results.forEach(function (space: any) {
				result.push({
					id: space.id,
					name: space.name,
				});
			});
		}
		if (ajax_result._links && ajax_result._links.next) {
			url = "/jira/wiki" + ajax_result._links.next;
		} else {
			last = true;
		}
	}
	return result;
};
