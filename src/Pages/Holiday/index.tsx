import {
	Grid,
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
import {
	getAllHolidays,
	getAllUsHolidays,
	getDate,
	getDateDistance,
	getDateStringWithDayOfWeek,
	getHolidays,
} from "@src/Api";
import { cleanHolidayName, getHolidayDuck } from "@src/Components/Duck/const";
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

const HolidayPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const this_year = new Date().getFullYear() + "";
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const [year, setYear] = useState<string>(searchParams.get("year") || this_year);
	const [holidayCategory, setHolidayCategory] = useState<"Bank" | "Extended" | "Jewish and Extended">("Bank");
	const with_ducks = searchParams.get("withDucks") != null;
	const year_as_int = parseInt(this_year);

	const loadParams = () => {
		setYear(searchParams.get("year") || this_year);
		const cat = searchParams.get("holidayCategory");
		if (cat) {
			if (cat == "Extended" || cat == "Jewish and Extended" || cat == "Bank") {
				setHolidayCategory(cat);
			}
		}
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	let years_choices: string[] = [];
	for (let val = year_as_int - 1; val <= year_as_int + 10; val++) {
		years_choices.push(val + "");
	}

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (year != this_year) {
			newSearchParams.set("year", year);
		} else {
			newSearchParams.delete("year");
		}
		if (holidayCategory && holidayCategory != "Bank") {
			newSearchParams.set("holidayCategory", holidayCategory);
		} else {
			newSearchParams.delete("holidayCategory");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [year, holidayCategory]);
	let holidays: HolidayProps[];
	if (holidayCategory == "Jewish and Extended") {
		holidays = getAllHolidays(year);
	} else if (holidayCategory == "Extended") {
		holidays = getAllUsHolidays(year);
	} else {
		holidays = getHolidays(year);
	}
	return (
		<>
			{!isDashboard && (
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, md: 3 }}>
						<InputLabel id="Year">Year</InputLabel>
						<Select
							label="Year"
							value={year}
							onChange={(event) => {
								setYear(event.target.value);
							}}
						>
							{years_choices.map((year) => (
								<MenuItem key={year} value={year}>
									{year}
								</MenuItem>
							))}
						</Select>
					</Grid>
					<Grid size={{ xs: 12, md: 3 }}>
						<InputLabel id="holidayCategory">Holiday Category</InputLabel>
						<Select
							label="Holiday Category"
							value={holidayCategory}
							onChange={(event) => {
								const cat = event.target.value;
								if (cat == "Extended" || cat == "Jewish and Extended" || cat == "Bank") {
									setHolidayCategory(cat);
								}
							}}
						>
							{["Bank", "Extended", "Jewish and Extended"].map((category) => (
								<MenuItem key={category} value={category}>
									{category}
								</MenuItem>
							))}
						</Select>
					</Grid>
				</Grid>
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
								<TableCell>{getDateDistance(holiday.date)}</TableCell>
							</DateRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};
export default HolidayPage;
