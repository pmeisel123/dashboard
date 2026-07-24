import type { MessageProp } from "@src/Api";
import { sleep } from "@src/Api";

export const processResponse = async (response: Response) => {
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
	} else {
		return null;
	}
	return results;
};

export const getChannelApi = async (instance: string, channelId: string): Promise<MessageProp[]> => {
	const url = "/slack/" + instance + "/conversations.history?channel=" + channelId;
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	let response = await fetch(url, options);
	let results: MessageProp[] | null = await processResponse(response);
	if (results == null) {
		await sleep(2);
		response = await fetch(url, options);
		results = await processResponse(response);
	}
	if (results == null) {
		return [];
	}

	return results;
};
