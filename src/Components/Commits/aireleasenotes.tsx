import { Box, Link } from "@mui/material";
import type { AiReleaseNotesResponseWrapper, BranchCommit, RootState, TicketProps, AiError } from "@src/Api";
import { postGeminiApiForReleaseNotes } from "@src/Api";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const AiReleaseNotes: FC<{
	tickets: { [key: string]: TicketProps };
	commits: BranchCommit[];
}> = ({ tickets, commits }) => {
	const config = useSelector((state: RootState) => state.configState);
	const [notes, setNotes] = useState<AiReleaseNotesResponseWrapper | AiError | null>(null);

	useEffect(() => {
		postGeminiApiForReleaseNotes(tickets, commits).then((notes) => {
			setNotes(notes);
		});
	}, [tickets, commits]);
	if (!notes) {
		return <div>Loading Ai Release Notes (may be slow)...</div>;
	}
	if ("error" in notes) {
		return <div>Error loading Ai Release Notes: {notes.error}</div>;
	}
	if (!('response' in notes) || !notes.response || !notes.response.releaseNotes) {
		return <div>Error loading Ai Release Notes. Unknown error.</div>;
	}
	return (
		<div>
			<h2>AI powered Release Notes</h2>
			{notes.response.releaseNotes.sections.map((section, index) => (
				<div key={index}>
					<h3>{section.title}</h3>
					<ul>
						{section.items.map((item, itemIndex) => (
							<li key={itemIndex}>
								{item.ticket && tickets[item.ticket] && (
									<Link
										href={(config.API_URL + "/browse/" + item.ticket) as string}
										target="_blank"
										rel="noopener"
									>
										{item.ticket}:{tickets[item.ticket].summary}
									</Link>
								)}{" "}
								{item.summary}
								{item.description && <Box sx={{ paddingLeft: "10px" }}>{item.description}</Box>}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};
