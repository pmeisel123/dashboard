import type { ChannelProp, MessageProp, SlackEmojisProp, SlackFile, SlackUserProp } from "@src/Api";
import { decodeUtf8String, getSlackUserNameAndAvatar } from "@src/Api";
import type { FC } from "react";
import { Message } from "slack-blocks-to-jsx";
import "slack-blocks-to-jsx/dist/style.css";

export const SlackFileAttachmentList: FC<{ files: SlackFile[] }> = ({ files }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
			{files.map((file) => {
				const isImage = file.mimetype.startsWith("image/");
				const safeFileName = decodeUtf8String(file.name);
				return (
					<div
						key={file.id}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							padding: "10px",
							border: "1px solid #e2e2e2",
							borderRadius: "8px",
							maxWidth: "400px",
							backgroundColor: "#f8f8f8",
						}}
					>
						{isImage ? (
							<img
								src={file.url_private_download}
								alt={safeFileName}
								style={{ width: "48px", height: "48px", borderRadius: "4px", objectFit: "cover" }}
							/>
						) : (
							<div style={{ fontSize: "20px" }}>&#12844;</div>
						)}
						<div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							<a
								href={file.url_private_download}
								target="_blank"
								rel="noreferrer"
								style={{
									color: "#1264a3",
									textDecoration: "none",
									fontWeight: "bold",
									fontSize: "14px",
								}}
							>
								{safeFileName}
							</a>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export const SlackMessage: FC<{
	message: MessageProp;
	emojis: SlackEmojisProp;
	users: { [key: string]: SlackUserProp };
	channels: { [key: string]: ChannelProp };
}> = ({ message, emojis, users, channels }) => {
	const { user: userId, text, ts, files } = message;
	const [senderDisplayName, senderAvatar] = getSlackUserNameAndAvatar(users, userId);

	let timeDisplayString = "";
	const numericTs = parseFloat(ts) || 0;

	if (ts) {
		const dateObject = !isNaN(numericTs) ? new Date(numericTs * 1000) : new Date(ts);
		timeDisplayString = dateObject.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	}

	const blocksPayload = [
		{
			type: "section" as const, // Fixes TS2322 Block assignment error
			text: {
				type: "mrkdwn" as const,
				text: decodeUtf8String(text),
			},
		},
	];

	return (
		<div
			className="slack-message-wrapper"
			style={{ fontFamily: "sans-serif", ["--slack-msg-time" as any]: `"${timeDisplayString}"` }}
		>
			<style>{`
				.slack-message-wrapper div[class*="bg-black-primary"],
				.slack-message-wrapper .slack_blocks_to_jsx--header > div:nth-child(2) {
					display: none !important;
				}
				.slack-message-wrapper .slack_blocks_to_jsx--header > div:last-child {
					font-size: 0 !important;
					line-height: 0 !important;
					margin-top: 6px;
				}
				.slack-message-wrapper .slack_blocks_to_jsx--header > div:last-child::after {
					content: var(--slack-msg-time);
					font-size: 12px;
				}
				.slack-message-wrapper #slack_blocks_to_jsx section {
					max-width: 100%
				}
			`}</style>
			<Message
				blocks={blocksPayload}
				name={senderDisplayName}
				logo={senderAvatar}
				time={!isNaN(numericTs) ? new Date(numericTs * 1000) : new Date(ts)}
				hooks={{
					emoji: (data: any, defaultParser: any) => {
						const customEmojiUrl = emojis[data.name];
						if (customEmojiUrl) {
							return (
								<img
									src={customEmojiUrl}
									alt={data.name}
									style={{
										margin: "0 0.1em",
										width: "1em",
										height: "1em",
										display: "inline",
										verticalAlign: "middle",
									}}
								/>
							);
						}
						return defaultParser(data);
					},
					user: (data: any) => {
						const internalMentionedUser = users[data.id];
						const rawMentionName =
							internalMentionedUser?.profile?.display_name || internalMentionedUser?.real_name || data.id;
						return <strong style={{ color: "#1d1c1d" }}>@{decodeUtf8String(rawMentionName)}</strong>;
					},

					channel: (data: any) => {
						const internalChannel = channels[data.id];
						const rawChannelName = internalChannel?.name || data.id;
						return (
							<span style={{ color: "#1264a3", fontWeight: 500, cursor: "pointer" }}>
								#{decodeUtf8String(rawChannelName)}
							</span>
						);
					},
				}}
			/>
			{files && files.length > 0 && <SlackFileAttachmentList files={files as unknown as SlackFile[]} />}
		</div>
	);
};
