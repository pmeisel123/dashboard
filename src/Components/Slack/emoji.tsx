import type { SlackEmojisProp } from "@src/Api";
import emoji from "emoji-dictionary";
import type { FC } from "react";

export const SlackEmoji: FC<{
	emojis: SlackEmojisProp;
	emojiName: string;
}> = ({ emojis, emojiName }) => {
	if (!emojis) {
		return <></>;
	}
	if (!emojiName) {
		return <>?</>;
	}
	if (emojiName && emojis[emojiName]) {
		let definition = emojis[emojiName];
		if (definition.startsWith("alias:")) {
			const alias = definition.split(":")[1];
			return <SlackEmoji emojis={emojis} emojiName={alias} />;
		}
		return (
			<img
				src={emojis[emojiName]}
				alt={emojiName}
				style={{ margin: "0 0.1em", width: "1em", height: "1em", verticalAlign: "middle" }}
			/>
		);
	} else {
		const unicodeEmoji = emoji.getUnicode(emojiName);
		return <>{unicodeEmoji || emojiName}</>;
	}
};
