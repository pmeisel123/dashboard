export interface ChannelProp {
	id: string;
	name: string;
	num_members: number;
	description: string;
	topic: string;
}

export interface SlackUserProp {
	id: string;
	name: string;
	real_name?: string;
	profile: {
		display_name?: string;
		real_name?: string;
		image_24?: string;
		image_48?: string;
		image_512?: string;
	};
}

export interface SlackFile {
	id: string;
	name: string;
	mimetype: string;
	url_private_download: string;
}

export interface MessageProp {
	user: string;
	text: string;
	ts: string;
	files?: SlackFile[];
	userName?: string;
}

export interface SlackEmojisProp {
	[key: string]: string;
}
