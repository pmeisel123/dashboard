import type { SlackUserProp } from "../Types";
export const getUserssApi = async (instance: string): Promise<{ [key: string]: SlackUserProp }> => {
	const url = "/slack/" + instance + "/users.list";
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const ajax_result: any = await response.json();
	const results: { [key: string]: SlackUserProp } = {};
	if (ajax_result?.members) {
		ajax_result.members.forEach((ajax_user: SlackUserProp) => {
			results[ajax_user.id] = ajax_user;
		});
	}
	console.log(results);
	return results;
};
