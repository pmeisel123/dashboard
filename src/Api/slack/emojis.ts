import type { SlackEmojisProp } from "../Types";
export const getEmojisApi = async (instance: string): Promise<SlackEmojisProp> => {
	const url = "/slack/" + instance + "/emoji.list";
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const ajax_result: any = await response.json();
	if (ajax_result?.emoji) {
		return ajax_result.emoji as SlackEmojisProp;
	}
	return {};
};
