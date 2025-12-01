import holidays from "date-holidays";

export const getHolidays = (year: string) => {
	const hd = new holidays("US"); // For United States
	const usHolidays = hd.getHolidays(year).filter((holiday) => {
		return holiday.type === "public" || holiday.type === "bank";
	});
	return usHolidays;
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
