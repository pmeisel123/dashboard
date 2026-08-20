import type {
	AiError,
	AiEstimationsResponseWrapper,
	AiReleaseNotesResponseWrapper,
	AiSlackSummaryResponseWrapper,
	BranchCommit,
	HolidayProps,
	MessageProp,
	TicketProps,
	UserProps,
} from "@src/Api";

export const postGeminiApi = async (
	users: UserProps[],
	tickets: { [key: string]: TicketProps },
	holidays: Record<string, HolidayProps>,
	defaultEstimate: number,
	estimatePadding: number,
): Promise<AiEstimationsResponseWrapper | AiError> => {
	const url = "/server/gemini/estimator";
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
	const data: AiEstimationsResponseWrapper | AiError = await response.json();
	return data;
};

export const postGeminiApiForReleaseNotes = async (
	tickets: { [key: string]: TicketProps },
	commits: BranchCommit[],
): Promise<AiReleaseNotesResponseWrapper | AiError> => {
	const url = "/server/gemini/releasenotes";
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
	const data: AiReleaseNotesResponseWrapper | AiError = await response.json();
	return data;
};

export const postGeminiApiForSlackSummary = async (
	messages: MessageProp[],
): Promise<AiSlackSummaryResponseWrapper | AiError> => {
	const url = "/server/gemini/slacksummary";
	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(messages),
	};
	const response = await fetch(url, requestOptions);
	const data: AiSlackSummaryResponseWrapper | AiError = await response.json();
	return data;
};
