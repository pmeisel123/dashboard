import { Box, styled } from "@mui/material";
import type { ChannelProp, MessageProp, SlackEmojisProp, SlackUserProp } from "@src/Api";
import { Ago, SlackApiSummary } from "@src/Components";
import type { FC } from "react";
import { Fragment } from "react";
import "slack-blocks-to-jsx/dist/style.css";
import { SlackMessage } from "./message";

const getDate = (date: Date): string => {
	return date.toLocaleDateString();
};
const StyledDate = styled(Box)(() => ({
	backgroundColor: "#AA0",
	textAlign: "center",
	margin: "1px 0 0 0 !important",
	padding: "5px 0",
}));

const tenMinutes = 600000;

export const SlackChannel: FC<{
	messages: MessageProp[];
	channel: ChannelProp;
	emojis: SlackEmojisProp;
	users: { [key: string]: SlackUserProp };
	lastUpdated: number;
	channels: { [key: string]: ChannelProp };
}> = ({ messages, channel, emojis, users, lastUpdated, channels }) => {
	if (!messages.length) {
		return null;
	}
	const day: Date = new Date();
	day.setHours(0, 0, 0, 0);
	return (
		<>
			{channel && (
				<>
					<div>Channel: {channel.name}</div>
					{channel.description && <div>Description: {channel.description}</div>}
					{channel.topic && <div>Topic: {channel.topic}</div>}
				</>
			)}
			<SlackApiSummary messages={messages} users={users} />

			<StyledDate key={getDate(day)}>Today</StyledDate>
			{messages.map((message) => {
				const messageTime = (parseFloat(message.ts) || 0) * 1000;
				let days = [];
				while (messageTime < day.getTime()) {
					day.setDate(day.getDate() - 1);
					days.push(new Date(day));
				}
				const isRecent = messageTime > lastUpdated - tenMinutes;
				return (
					<Fragment key={message.ts}>
						{!!days.length && (
							<div style={{ marginBottom: "10px" }}>
								{days.map((displayDay) => (
									<StyledDate key={getDate(displayDay)}>
										{getDate(displayDay)} ({Ago(displayDay)} ago)
									</StyledDate>
								))}
							</div>
						)}
						<div style={{ backgroundColor: isRecent ? "#FFD" : "" }} key={message.ts}>
							<SlackMessage message={message} emojis={emojis} users={users} channels={channels} />
						</div>
					</Fragment>
				);
			})}
		</>
	);
};
