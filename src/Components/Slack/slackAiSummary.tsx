import type { AiError, AiSlackSummaryResponseWrapper, MessageProp, SlackUserProp } from "@src/Api";
import { getSlackUserNameAndAvatar, postGeminiApiForSlackSummary } from "@src/Api";
import type { FC } from "react";
import { useEffect, useState } from "react";

const replaceMentionsWithUserNames = (text: string, userMap: { [key: string]: string }): string => {
	Object.keys(userMap).forEach((userId) => {
		const userMention = `<@${userId}>`;
		const userName = userMap[userId];
		if (text.includes(userMention)) {
			text = text.replaceAll(userMention, `@${userName}`);
		}
	});
	return text;
};

export const SlackApiSummary: FC<{
	messages: MessageProp[];
	users: { [key: string]: SlackUserProp };
}> = ({ messages, users }) => {
	const [aiResponse, setAiResponse] = useState<AiSlackSummaryResponseWrapper | AiError | null>(null);
	const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
	useEffect(() => {
		const userMap = Object.keys(users).reduce(
			(acc, userId) => {
				const [userName, _avatar] = getSlackUserNameAndAvatar(users, userId);
				acc[userId] = userName;
				return acc;
			},
			{} as { [key: string]: string },
		);
		setUserMap(userMap);
	}, [users]);
	useEffect(() => {
		if (messages.length && Object.keys(userMap).length) {
			const detailedMessages: MessageProp[] = messages.map((message) => {
				const userId = message.user;
				const userName = userMap[userId] || userId;
				let text = message.text || "";
				text = replaceMentionsWithUserNames(text, userMap);
				return {
					...message,
					text: text,
					userName: userName,
				};
			});
			postGeminiApiForSlackSummary(detailedMessages).then((response) => {
				setAiResponse(response);
			});
		}
	}, [messages, userMap]);
	if (!aiResponse) {
		return <div>Loading AI summary (may be slow)...</div>;
	}
	if ("error" in aiResponse) {
		return <div>Error loading Ai Release Notes: {aiResponse.error}</div>;
	}
	if (!("response" in aiResponse) || !aiResponse.response || !aiResponse.response.summary) {
		return <div>Error loading Ai Release Notes. Unknown error.</div>;
	}

	return (
		<div>
			<h2>AI powered Slack Summary</h2>
			<pre>{aiResponse.response.summary}</pre>
		</div>
	);
};
