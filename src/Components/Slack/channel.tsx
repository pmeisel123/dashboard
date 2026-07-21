import { Box, styled } from "@mui/material";
import type { ChannelProp, MessageProp, SlackEmojisProp, SlackUserProp } from "@src/Api";
import type { FC } from "react";
import "slack-blocks-to-jsx/dist/style.css";
import { formatSlackMessage } from "./message";

const getDate = (date: Date): string => {
	return date.toLocaleDateString();
};
const StyledDate = styled(Box)(() => ({
	backgroundColor: "#AA0",
	textAlign: "center",
	margin: "1px 0 0 0 !important",
	padding: "5px 0",
}));

export const SlackChannel: FC<{
	messages: MessageProp[];
	channel: ChannelProp;
	emojis: SlackEmojisProp;
	users: { [key: string]: SlackUserProp };
}> = ({ messages, emojis, users }) => {
	if (!messages.length) {
		return null;
	}
	const day: Date = new Date();
	day.setHours(0, 0, 0, 0);
	return (
		<>
			<StyledDate key={getDate(day)}>Today</StyledDate>
			{messages.map((message) => {
				let days = [];
				while ((parseFloat(message.ts) || 0) * 1000 < day.getTime()) {
					day.setDate(day.getDate() - 1);
					days.push(getDate(day));
				}
				return (
					<>
						{days.map((displayDay) => (
							<StyledDate key={displayDay}>{displayDay}</StyledDate>
						))}
						<div key={message.ts}>{formatSlackMessage(message, emojis, users)}</div>
					</>
				);
			})}
		</>
	);
};
