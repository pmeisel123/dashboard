import type { CalOptions } from "@hebcal/core";
import { HebrewCalendar, Location } from "@hebcal/core";
import holidays from "date-holidays";
import type { HolidayProps } from "./types";

const JewishHolidaysList = (year: string) => {
	const loc = Location.lookup("San Francisco");

	const options: CalOptions = {
		year: parseInt(year),
		isHebrewYear: false,
		candlelighting: false,
		location: loc,
		sedrot: false,
		omer: false,
	};

	const events = HebrewCalendar.calendar(options);
	const holidays: HolidayProps[] = [];
	events.forEach((event) => {
		const secular = getHolidayDayString(event.greg());
		const name = renameHoliday(event.desc);
		/*if (name.match(/Rosh Chodesh/)) {
			return;
		}
		*/
		if (!event.getCategories().includes("major")) {
			return;
		}
		console.log(name, event.getCategories());
		holidays.push({
			name: name,
			date: secular,
			type: "Jewish",
		});
	});
	return holidays;
};

const HOLIDAY_RENAME: { [key: string]: string } = {
	"Columbus Day": "Indigenous Peoples' Day",
	"Washington's Birthday": "Presidents' Day",
	"Day after Thanksgiving": "Black Friday",
	Pesach: "Passover",
};

const renameHoliday = (name: string) => {
	if (name in HOLIDAY_RENAME) {
		return HOLIDAY_RENAME[name];
	}
	return name;
};

export const getHolidays = (year: string): HolidayProps[] => {
	const hd = new holidays("US"); // For United States
	const holidaysUs: HolidayProps[] = [];
	hd.getHolidays(year).forEach((holiday) => {
		if (holiday.type === "public" || holiday.type === "bank") {
			let name = renameHoliday(holiday.name);
			holidaysUs.push({
				name: name,
				date: getHolidayDayString(new Date(holiday.date)),
				type: "US",
				bank: true,
			});
		}
	});
	return holidaysUs;
};

export const getAllUsHolidays = (year?: string): HolidayProps[] => {
	if (!year) {
		year = new Date().getUTCFullYear() + "";
	}
	const hd = new holidays("US"); // For United States
	const usHolidays: HolidayProps[] = [];
	hd.getHolidays(year).forEach((holiday) => {
		let name = renameHoliday(holiday.name);
		usHolidays.push({
			name: name,
			date: getHolidayDayString(new Date(holiday.date)),
			type: "US",
			bank: holiday.type === "public" || holiday.type === "bank",
		});
	});
	return usHolidays;
};

let allHolidays: { [year: string]: HolidayProps[] } = {};

export const getAllHolidays = (year?: string): HolidayProps[] => {
	if (!year) {
		year = new Date().getUTCFullYear() + "";
	}
	if (allHolidays[year]) {
		return allHolidays[year];
	}
	const hd = new holidays("US"); // For United States
	const usHolidays: HolidayProps[] = [];
	hd.getHolidays(year).forEach((holiday) => {
		let name = renameHoliday(holiday.name);
		usHolidays.push({
			name: name,
			date: holiday.date,
			type: "US",
		});
	});
	const jewishHolidays = JewishHolidaysList(year);
	allHolidays[year] = [...usHolidays, ...jewishHolidays];
	allHolidays[year].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);
	return allHolidays[year];
};

export const getHolidayDayString = (dateObj: Date) => {
	let month: string | number = dateObj.getUTCMonth() + 1; // months from 1-12
	let day: string | number = dateObj.getUTCDate();
	const year = dateObj.getUTCFullYear();

	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return year + "-" + month + "-" + day + " 00:00:00";
};

export const getDayString = (dateObj: Date) => {
	let month: string | number = dateObj.getUTCMonth() + 1; // months from 1-12
	let day: string | number = dateObj.getUTCDate();
	const year = dateObj.getUTCFullYear();

	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return year + "/" + month + "/" + day;
};
export const getJiraDayString = (dateObj: Date) => {
	let month: string | number = dateObj.getUTCMonth() + 1; // months from 1-12
	let day: string | number = dateObj.getUTCDate();
	const year = dateObj.getUTCFullYear();

	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return year + "-" + month + "-" + day;
};

export const getDateString = (dateObj: Date) => {
	const month = dateObj.toLocaleString("default", { month: "long" });
	const day = dateObj.getUTCDate();
	const year = dateObj.getUTCFullYear();
	if (year != new Date().getUTCFullYear()) {
		return month + " " + day + " " + year;
	}
	return month + " " + day;
};
export const getDateStringWithDayOfWeek = (dateObj: Date) => {
	return (
		dateObj.toLocaleDateString("en-US", { weekday: "long" }) +
		" " +
		getDateString(dateObj)
	);
};
