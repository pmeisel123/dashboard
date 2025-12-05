import { getAllHolidays, getHolidayDayString } from "@src/Api";

const holiday_images: { [key: string]: string[] } = {
	Chanukah: ["hanukkah.png", "jewish.png"],
	Veterans: ["military.png"],
	Memorial: ["military.png"],
	Thanksgiving: ["turkey.png", "thanksgiving.png"],
	"Black Friday": ["black.png"],
	"Cyber Monday": ["cyber.png"],
	Halloween: ["trick.gif", "ghost.gif", "ghost2.png", "vampire.png"],
	"Day of the dead": ["diadelosmuertos.png"],
	"Ducky's Birthday": ["birthday.png"],
	Valentine: ["love.gif"],
	"Talk like a pirate day": ["pirate.png"],
	"New Year": ["birthday.png"],
	"Friday the 13th": ["jason.png"],
	"St. Patrick": ["stpatrick.png"],
	Passover: ["passover.png"],
	"Rosh Hashana": ["rosh.png"],
	"Erev Rosh Hashana": ["rosh.png"],
	"Erev Yom Kippur": ["rosh.png"],
	"Yom Kippur": ["rosh.png"],
	"Presidents'": ["lincoln.png"],
	"May the forth'": ["jedi.png"],
};

export const cleanHolidayName = (holiday: string) => {
	const new_name = holiday
		.replace(/:.*/, "")
		.replace(/'s .*/, "")
		.replace(/ Day/, "")
		.replace(/ [IV0-9].*/, "");
	return new_name;
};

const globalHolidays: { [key: string]: { [key: string]: string } } = {};
const getHolidays = (year?: string) => {
	if (!year) {
		year = new Date().getUTCFullYear() + "";
	}
	if (globalHolidays[year]) {
		return globalHolidays[year];
	}
	const holidays = getAllHolidays(year).reduce(
		(hol: { [key: string]: string }, holiday) => {
			if (
				hol[holiday.date] &&
				hol[holiday.date] in holiday_images
			) {
				return hol;
			}
			const clean_name = cleanHolidayName(holiday.name);
			if (!(clean_name in holiday_images)) {
				/*
			if (holiday.type == 'US') {
				console.log(clean_name);
			}
			*/
				return hol;
			}
			hol[holiday.date] = clean_name;
			if (hol[holiday.date] == "Thanksgiving") {
				const week = new Date(holiday.date);
				week.setDate(week.getDate() - 4);
				while (
					getHolidayDayString(week) !=
					holiday.date
				) {
					hol[getHolidayDayString(week)] =
						"Thanksgiving";
					week.setDate(week.getDate() + 1);
				}
				let cyberMonday = new Date(holiday.date);
				cyberMonday.setDate(cyberMonday.getDate() + 4);
				hol[getHolidayDayString(cyberMonday)] =
					"Cyber Monday";
			}
			if (hol[holiday.date] == "Day after Thanksgiving") {
				hol[holiday.date] = "Black Friday";
			}
			if (hol[holiday.date] == "Pesach") {
				hol[holiday.date] = "Passover";
			}
			return hol;
		},
		{},
	);

	holidays[getHolidayDayString(new Date(year + "-08-24"))] =
		"Ducky's Birthday";
	holidays[getHolidayDayString(new Date(year + "-09-19"))] =
		"Talk like a pirate day'";
	holidays[getHolidayDayString(new Date(year + "-11-01"))] =
		"Day of the dead";
	for (var i = 2; i < 5; i++) {
		holidays[getHolidayDayString(new Date(year + "-01-0" + i))] =
			"New Year";
	}
	holidays[getHolidayDayString(new Date(year + "-5-04"))] =
		"May the forth";
	for (i = 1; i <= 12; i++) {
		let month = i + "";
		if (i < 10) {
			month = "0" + i;
		}
		const thirteenth = new Date(year + "-" + month + "-13");
		if (thirteenth.getDay() == 4) {
			holidays[getHolidayDayString(thirteenth)] =
				"Friday the 13th";
		}
	}
	globalHolidays[year] = holidays;
	return holidays;
};
const thisYear = new Date().getUTCFullYear() + "";
getHolidays(thisYear);

export const getHolidayDuck = (day?: string) => {
	if (!day) {
		day = getHolidayDayString(new Date());
	}
	const year = new Date(day).getUTCFullYear() + "";
	const holidays = getHolidays(year);
	if (day in holidays) {
		let holiday_day = holidays[day];
		if (holiday_day in holiday_images) {
			const day_images = holiday_images[holiday_day];
			const day_image =
				day_images[
					Math.floor(
						Math.random() *
							day_images.length,
					)
				];
			const duck_title = holidays[day];
			return [duck_title, day_image];
		}
	}
	return ["", ""];
};
