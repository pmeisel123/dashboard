import { Box, Typography } from "@mui/material";
import type { HolidayProps } from "@src/Api";
import { getAllUsHolidays, getDate, getDateDistance, getDateStringWithDayOfWeek } from "@src/Api";
import { StyledTextfit } from "./const";

export const NextHolidayPage = () => {
	const year = new Date().getFullYear() + "";
	let holidays = getAllUsHolidays(year);
	const today = new Date();
	today.setHours(0, 0, 0);

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
			<Typography noWrap sx={{ height: "100%" }} component={Box}>
				<StyledTextfit>
					{nextholiday.name} <br /> {getDateStringWithDayOfWeek(new Date(nextholiday.date))}
					<br />
					{getDateDistance(nextholiday.date)}
				</StyledTextfit>
			</Typography>
		);
	}
	return null;
};
