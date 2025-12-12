import type { HolidayProps } from "@src/Api";
import { getAllUsHolidays, getDate, getDateStringWithDayOfWeek } from "@src/Api";
import { formatDistanceToNow } from "date-fns";
import { StyledTextfit } from "./const";

export const NextHolidayPage = () => {
	const year = new Date().getFullYear() + "";
	let holidays = getAllUsHolidays(year);
	const today = new Date();

	let nextholiday: HolidayProps | undefined;
	holidays.map((holiday) => {
		if (getDate(holiday.date) >= today && !nextholiday) {
			nextholiday = holiday;
		}
	});

	if (!nextholiday) {
		holidays = getAllUsHolidays(year + 1);
		holidays.map((holiday) => {
			if (getDate(holiday.date) >= today && !nextholiday) {
				nextholiday = holiday;
			}
		});
	}

	if (nextholiday) {
		return (
			<StyledTextfit>
				{nextholiday.name} <br /> {getDateStringWithDayOfWeek(new Date(nextholiday.date))}
				<br />
				{formatDistanceToNow(getDate(nextholiday.date), {
					addSuffix: true,
				})}
			</StyledTextfit>
		);
	}
	return null;
};
