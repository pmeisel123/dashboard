import type {
	AiEstimationsResponseWrapper,
	AiReleaseNotesResponseWrapper,
	BranchCommit,
	HolidayProps,
	TicketProps,
	UserProps,
} from "@src/Api";

export const postGeminiApi = async (
	users: UserProps[],
	tickets: { [key: string]: TicketProps },
	holidays: Record<string, HolidayProps>,
	defaultEstimate: number,
	estimatePadding: number,
): Promise<AiEstimationsResponseWrapper> => {
	const url = "server/gemini/estimator";
	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			users,
			tickets,
			holidays,
			defaultEstimate,
			estimatePadding,
		}),
	};
	const response = await fetch(url, requestOptions);
	const data: AiEstimationsResponseWrapper = await response.json();
	return data;
};

export const postGeminiApiForReleaseNotes = async (
	tickets: { [key: string]: TicketProps },
	commits: BranchCommit[],
): Promise<AiReleaseNotesResponseWrapper> => {
	const url = "server/gemini/releasenotes";
	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			tickets,
			commits,
		}),
	};
	const response = await fetch(url, requestOptions);
	const data: AiReleaseNotesResponseWrapper = await response.json();
	return data;
};
