import { getHolidayDayString } from "./holiday";
import type { UserEditVacation } from "./Types";

export const getVacationApi = async () => {
	let results: { [key: string]: string[] } = {};
	let response = await fetch("/vacation.csv");
	if (!response.body) {
		return results;
	}
	const reader = response.body.getReader();
	const result = await reader.read();
	const decoder = new TextDecoder("utf-8");
	const csvString = decoder.decode(result.value);
	const csvArrayString = csvString.split(/\n/g);
	const midnight = new Date();
	midnight.setHours(0, 0, 0, 0);
	csvArrayString.forEach((row: string) => {
		var rowArray = row.split(/,/g);
		const key: string | undefined = rowArray.shift();
		if (key) {
			results[key] = rowArray
				.filter((date: string) => new Date(date + " 01:00:00") >= midnight)
				.map((date: string) => getHolidayDayString(new Date(date)))
				.sort();
		}
	});
	return results;
};

export const vacationUpdateApi = async (vacations: UserEditVacation) => {
	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(vacations),
	};
	const response = await fetch("/post/vacation", requestOptions);
	const data = await response;
	return data;
};
