import {
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import type { HolidayProps } from "@src/Api";
import { getAllHolidays, getAllUsHolidays, getDateStringWithDayOfWeek, getHolidays } from "@src/Api";
import { cleanHolidayName, getHolidayDuck } from "@src/Components/Duck/const";
import { formatDistanceToNow } from "date-fns";
import type { FC } from "react";
import { useEffect, useState } from "react";

import { useOutletContext, useSearchParams } from "react-router-dom";
import { DateRow } from "./const";

const HolidayDuck: FC<{ day: string; name: string }> = ({ day, name }) => {
	const [duck_title, holiday_duck] = getHolidayDuck(day);
	if (!holiday_duck) {
		return;
	}
	if (duck_title != cleanHolidayName(name)) {
		// console.log(duck_title, cleanHolidayName(name), day);
		return;
	}
	return (
		<img
			style={{
				height: "30px",
				width: "30px",
				position: "absolute",
				margin: "-5px 0 0 5px",
			}}
			src={"/ducks/" + holiday_duck}
		/>
	);
};

const HolidayPage = () => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const this_year = new Date().getFullYear() + "";
	const [searchParams, setSearchParams] = useSearchParams();
	const [year, setYear] = useState<string>(searchParams.get("year") || this_year);
	const [extended, setExtended] = useState<boolean>(searchParams.get("extended") == "true");
	const [withJewish, setWithJewish] = useState<boolean>(searchParams.get("withJewish") == "true");
	const with_ducks = searchParams.get("withDucks") != null;
	const year_as_int = parseInt(this_year);

	const today = new Date();
	const loadParams = () => {
		setYear(searchParams.get("year") || this_year);
		setExtended(searchParams.get("extended") == "true");
		setWithJewish(searchParams.get("withJewish") == "true");
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	let years_choices: string[] = [];
	for (let val = year_as_int - 1; val <= year_as_int + 10; val++) {
		years_choices.push(val + "");
	}

	const getDate = (date_string: string) => {
		let date = new Date(date_string);
		const hours = today.getHours();
		const minutes = today.getMinutes();
		const seconds = today.getSeconds();
		date.setHours(hours);
		date.setMinutes(minutes);
		date.setSeconds(seconds);

		return date;
	};

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (year != this_year) {
			newSearchParams.set("year", year);
		} else {
			newSearchParams.delete("year");
		}
		if (extended) {
			newSearchParams.set("extended", "true");
		} else {
			newSearchParams.delete("extended");
		}
		if (withJewish) {
			newSearchParams.set("withJewish", "true");
		} else {
			newSearchParams.delete("withJewish");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [year]);
	let holidays: HolidayProps[];
	if (withJewish) {
		holidays = getAllHolidays(year);
	} else if (extended) {
		holidays = getAllUsHolidays(year);
	} else {
		holidays = getHolidays(year);
	}
	return (
		<>
			{!isDashboard && (
				<>
					<InputLabel id="Year">Year</InputLabel>
					<Select
						label="Year"
						value={year}
						onChange={(event) => {
							setYear(event.target.value);
						}}
						sx={{ minWidth: 100 }}
					>
						{years_choices.map((year) => (
							<MenuItem key={year} value={year}>
								{year}
							</MenuItem>
						))}
					</Select>
				</>
			)}
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>When</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{holidays.map((holiday) => (
							<DateRow date={holiday.date} key={holiday.name + holiday.date}>
								<TableCell>
									{holiday.name}
									{with_ducks && <HolidayDuck day={holiday.date} name={holiday.name} />}
								</TableCell>
								<TableCell>{getDateStringWithDayOfWeek(getDate(holiday.date))}</TableCell>
								<TableCell>
									{formatDistanceToNow(getDate(holiday.date), {
										addSuffix: true,
									})}
								</TableCell>
							</DateRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};
export default HolidayPage;
