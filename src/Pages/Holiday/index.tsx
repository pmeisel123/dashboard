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
import { getDateStringWithDayOfWeek, getHolidays } from "@src/Api";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { DateRow } from "./const";

const HolidayPage = () => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const this_year = new Date().getFullYear() + "";
	const [searchParams, setSearchParams] = useSearchParams();
	const [year, setYear] = useState<string>(
		searchParams.get("year") || this_year,
	);
	const year_as_int = parseInt(this_year);

	const today = new Date();
	const loadParams = () => {
		setYear(searchParams.get("year") || this_year);
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
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [year]);
	const usHolidays = getHolidays(year);
	return (
		<>
			{!isDashboard && (<>
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
			</>)}
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
						{usHolidays.map((holiday) => (
							<DateRow date={holiday.date} key={holiday.name}>
								<TableCell>{holiday.name}</TableCell>
								<TableCell>
									{getDateStringWithDayOfWeek(
										getDate(holiday.date),
									)}
								</TableCell>
								<TableCell>
									{formatDistanceToNow(
										getDate(holiday.date),
										{
											addSuffix: true,
										},
									)}
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
