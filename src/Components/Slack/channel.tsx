import { Box, styled } from "@mui/material";
import type { ChannelProp, MessageProp, SlackEmojisProp, SlackUserProp } from "@src/Api";
import { SlackEmoji } from "@src/Components";
import type { FC } from "react";

const formatSlackMessage = (
	message: string,
	emojis: { [key: string]: string },
	users: { [key: string]: SlackUserProp },
) => {
	const combinedRegex = /(:[a-zA-Z0-9_+-]+:|<@U[A-Z0-9]+>)/g;
	const parts = message.split(combinedRegex);
	console.log(parts);
	return (
		<span>
			{parts.map((part, index) => {
				// Check if the current part is an emoji shortcode
				if (part.startsWith(":") && part.endsWith(":")) {
					// Remove the colons to get the pure emoji name (e.g., "duck")
					const emojiName = part.slice(1, -1);

					return <SlackEmoji key={index} emojis={emojis} emojiName={emojiName} />;
				}
				if (part.startsWith("<@") && part.endsWith(">")) {
					const userId = part.slice(2, -1); // Extracts just the "U123456"
					console.log(userId);
					return <GetUser key={index} users={users} userId={userId} />;
				}

				// Return regular text unchanged
				return part;
			})}
		</span>
	);
};

const getDate = (date: Date): string => {
	return date.toLocaleDateString();
};
const StyledDate = styled(Box)(({ theme }) => ({
	backgroundColor: "#AA0",
	textAlign: "center",
	margin: "1px 0 0 0 !important",
	padding: "5px 0",
}));

const GetUser = ({ users, userId }: { users: { [key: string]: SlackUserProp }; userId: string }) => {
	console.log(userId);
	if (users && users[userId]) {
		const user = users[userId];
		console.log(user);
		return <>&lt;{user.real_name}&gt;</>;
	}
	return <>&lt;{userId}&gt;</>;
};

export const SlackChannel: FC<{
	messages: MessageProp[];
	channel: ChannelProp;
	emojis: SlackEmojisProp;
	users: { [key: string]: SlackUserProp };
}> = ({ messages, channel, emojis, users }) => {
	if (!messages.length) {
		return null;
	}
	const day: Date = new Date();
	day.setHours(0, 0, 0, 0);
	return (
		<>
			<StyledDate key={day}>Today</StyledDate>
			{messages.map((message) => {
				let days = [];
				while (message.ts * 1000 < day.getTime()) {
					day.setDate(day.getDate() - 1);
					days.push(getDate(day));
				}
				return (
					<>
						{days.map((displayDay) => (
							<StyledDate key={displayDay}>{displayDay}</StyledDate>
						))}
						<div key={message.ts}>
							<GetUser users={users} userId={message.user} />:{" "}
							{formatSlackMessage(message.text, emojis, users)}
						</div>
					</>
				);
			})}
		</>
	);
};
