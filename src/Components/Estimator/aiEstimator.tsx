import type {
	AiError,
	AiEstimationsResponseWrapper,
	HolidayProps,
	TicketProps,
	UserProps,
	UsersGroupProps,
} from "@src/Api";
import { getAllUsHolidays, postGeminiApi } from "@src/Api";
import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect, useState } from "react";

const DISABLED = true;
// The AI estimator is currently disabled. This is because the Gemini API is very bad at estimating completion dates, and it is not worth the cost to use it. We may re-enable it in the future if the Gemini API improves.

const AiEstimator: FC<{
	users: Set<string>;
	tickets: { [key: string]: TicketProps };
	allJiraUsersGroups: UsersGroupProps;
	defaultEstimate: number;
	estimatePadding: number;
	setAiLastDay: Dispatch<SetStateAction<string>>;
}> = ({ users, tickets, allJiraUsersGroups, defaultEstimate, estimatePadding, setAiLastDay }) => {
	if (DISABLED) {
		return;
	}
	const [aiData, setAiData] = useState<AiEstimationsResponseWrapper | AiError | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const nextyear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

	const thisYearUsHolidays = getAllUsHolidays(today.getFullYear().toString()).filter((holiday) => {
		return new Date(holiday.date) >= today;
	});

	const nextYearUsHolidays = getAllUsHolidays(nextyear.getFullYear().toString()).filter((holiday) => {
		return new Date(holiday.date) <= nextyear;
	});

	const usHolidays = [...thisYearUsHolidays, ...nextYearUsHolidays].reduce(
		(newFormat, holiday) => {
			newFormat[holiday.date] = holiday;
			return newFormat;
		},
		{} as Record<string, HolidayProps>,
	);

	const local_users: UserProps[] = Array.from(users).map((key) => allJiraUsersGroups.users[key]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await postGeminiApi(local_users, tickets, usHolidays, defaultEstimate, estimatePadding);
				setAiData(data);
				setLoading(true);
			} catch (error) {
				console.error("Failed to fetch Gemini data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [users, tickets, allJiraUsersGroups]); // Re-runs if inputs change

	if (loading || !aiData) return <>Loading AI estimations (this may be slow)...</>;

	if ("error" in aiData) {
		return <>Failed to load AI estimations. Error: {aiData.error}</>;
	}

	if (!aiData || !aiData.response || !aiData.response.estimatedCompletionDate) {
		return (
			<>
				Failed to load AI estimations. <pre>{JSON.stringify(aiData)}</pre>
			</>
		);
	}
	setAiLastDay(aiData.response.estimatedCompletionDate);
	return (
		<>
			Estimated Completion Date: {aiData.response.estimatedCompletionDate}
			<br />
			{aiData.response.reasoning && <>Reasoning: {aiData.response.reasoning}</>}
			{aiData.modelUsed && (
				<>
					<br />
					Model: {aiData.modelUsed}
				</>
			)}
		</>
	);
};

export default AiEstimator;
