import {getHolidayDayString} from './holiday';




export const getVacationApi = async() =>  {
	let results: {[key: string]: string[]} = {};
	let response = await fetch('/src/assets/vacation.csv');
	if (!response.body) {
		return results;
	}
	const reader = response.body.getReader();
	const result = await reader.read();
	const decoder = new TextDecoder('utf-8');
	const csvString = decoder.decode(result.value);
	const csvArrayString = csvString.split(/\n/g);
	const midnight = new Date();
	midnight.setHours(0, 0, 0, 0);
	csvArrayString.forEach((row: string) => {
		var rowArray = row.split(/,/g);
		const key: string | undefined = rowArray.shift();
		if (key) {
			results[key] = rowArray.filter((date: string) => new Date(date + ' 01:00:00') >= midnight).map((date: string) => getHolidayDayString(new Date(date))).sort();
		}
	});
	return results;
}