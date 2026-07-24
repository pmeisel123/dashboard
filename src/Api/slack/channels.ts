import type { ChannelProp } from "../Types";

export const getChannelsApi = async (instance: string): Promise<{ [key: string]: ChannelProp }> => {
	const url = "/slack/" + instance + "/conversations.list";
	const options: RequestInit = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const ajax_result: any = await response.json();
	const results: { [key: string]: ChannelProp } = {};
	if (ajax_result?.channels) {
		for (const ajax_channel of ajax_result.channels) {
			const channel: ChannelProp = {
				id: ajax_channel.id,
				name: ajax_channel.name,
				num_members: ajax_channel.num_members,
				description: ajax_channel.purpose?.value || "",
				topic: ajax_channel.topic?.value || "",
			};
			results[channel.name] = channel;
		}
	}
	return results;
};
