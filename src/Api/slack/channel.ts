import type { MessageProp } from "../Types";

export const getChannelApi = async (instance: string, channelId: string): Promise<MessageProp[]> => {
	const url = "/slack/" + instance + "/conversations.history?channel=" + channelId;
	console.log("getChannelApi: ", url);
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const ajax_result: any = await response.json();
	const results: MessageProp[] = [];
	if (ajax_result?.messages) {
		for (const ajax_channel of ajax_result.messages) {
			const message: MessageProp = {
				user: ajax_channel.user,
				text: ajax_channel.text,
				ts: ajax_channel.ts,
				files: ajax_channel.files || [],
			};
			results.push(message);
		}
	}
	console.log("getChannelApi: ", results);
	return results;
};
