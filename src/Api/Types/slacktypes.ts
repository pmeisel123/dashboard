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
	};
}

interface SlackFile {
	id: string;
	name: string;
	mimetype: string;
	url_private_download: string;
}

export interface MessageProp {
	user: SlackUserProp;
	text: string;
	ts: string;
	files?: SlackFile[];
}
