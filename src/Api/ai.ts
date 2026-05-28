import type { HolidayProps, TicketProps, UserProps } from "@src/Api";
export const postGeminiApi = async (
	users: UserProps[],
	tickets: { [key: string]: TicketProps },
	holidays: Record<string, HolidayProps>,
	defaultEstimate: number,
	estimatePadding: number,
) => {
	const url = "/server/gemini";
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
	const data = await response.json();
	return data;
};
