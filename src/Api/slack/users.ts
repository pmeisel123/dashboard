import type { SlackUserProp } from "@src/Api";
import { decodeUtf8String, sleep } from "@src/Api";

const processResponse = async (response: Response) => {
	const ajax_result: any = await response.json();
	if (ajax_result?.members) {
		const results: { [key: string]: SlackUserProp } = {};
		ajax_result.members.forEach((ajax_user: SlackUserProp) => {
			results[ajax_user.id] = ajax_user;
		});
		return results;
	}
	return null;
};

export const getSlackUsersApi = async (instance: string): Promise<{ [key: string]: SlackUserProp }> => {
	const url = "/slack/" + instance + "/users.list";
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	let response = await fetch(url, options);
	let results = await processResponse(response);
	if (results == null) {
		sleep(2);
		response = await fetch(url, options);
		results = await processResponse(response);
	}
	if (results == null) {
		return {};
	}
	return results;
};

export const getSlackUserNameAndAvatar = (
	users: { [key: string]: SlackUserProp },
	userId: string,
): [string, string] => {
	if (users && users[userId]) {
		const matchedUser = users[userId];
		const rawDisplayName = matchedUser
			? matchedUser.profile.display_name ||
				matchedUser.profile.real_name ||
				matchedUser.real_name ||
				matchedUser.name
			: userId;
		const userName = decodeUtf8String(rawDisplayName);
		const userAvatar =
			matchedUser.profile.image_48 || matchedUser.profile.image_24 || matchedUser.profile.image_512 || "";
		return [userName, userAvatar];
	}
	return ["", ""];
};
