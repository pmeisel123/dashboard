import React, { useEffect, useState } from "react";

import {
	Checkbox,
	FormControlLabel,
	FormGroup,
	Paper,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import {
	fetchUsersAndGroups,
	getDateString,
	getHolidayDayString,
	getAllUsHolidays,
	isUserDataRecent,
} from "@src/Api";
import { EstimatorCell } from "@src/Components";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";

interface cellData {
	day: Date;
	holiday: string;
	nonBankholiday: boolean;
	weekend: boolean;
	whoisout: string[];
	past: boolean;
}

function WhoIsOutPage() {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const possibleUsersGroups = useSelector(
		(state: RootState) => state.usersAndGroupsState,
	);
	let param_groups = searchParams.get("groups");
	const [groups, setGroups] = useState<String[]>(
		param_groups ? param_groups.split(/,/g) : [],
	);
	const dispatch = useDispatch<AppDispatch>();

	const loadParams = () => {
		param_groups = searchParams.get("groups");
		setGroups(param_groups ? param_groups.split(/,/g) : []);
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		if (!isUserDataRecent(possibleUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);
	const today = new Date('2025-10-25');
	today.setHours(0, 0, 0, 0);
	const nextyear = new Date(
		new Date().setFullYear(new Date().getFullYear() + 1),
	);
	// Get holidays for a specific year
	const usHolidays = getAllUsHolidays(today.getFullYear().toString()).filter(
		(holiday) => {
			return new Date(holiday.date) >= today;
		},
	);
	
	const nextYearUsHolidays = getAllUsHolidays(
		nextyear.getFullYear().toString(),
	).filter((holiday) => {
		return new Date(holiday.date) <= nextyear;
	});

	const allNonBankHolidays:{[key: string]: string} = {};
	const allUsHolidays = [...usHolidays, ...nextYearUsHolidays].reduce(
		(newFormat, holiday) => {
			if (!holiday.bank) {
				allNonBankHolidays[holiday.date] = holiday.name;
				return newFormat;
			}
			newFormat[holiday.date] = holiday.name;
			return newFormat;
		},
		{} as Record<string, string>,
	);
	let rows: cellData[][] = [];

	const current_day = today;
	current_day.setDate(current_day.getDate() - current_day.getDay());
	current_day.setHours(0, 0, 0, 0);

	let users = possibleUsersGroups.users;
	const getRows = () => {
		if (groups.length) {
			users = {};
			Object.keys(possibleUsersGroups.users).forEach((user_id) => {
				const user = possibleUsersGroups.users[user_id];
				if (
					user.groups &&
					user.groups.some((item) => groups.includes(item))
				) {
					users[user_id] = user;
				}
			});
		} else {
			users = possibleUsersGroups.users;
		}
		let rows: cellData[][] = [];
		for (var week = 0; week <= 10; week++) {
			let row: cellData[] = [];
			for (var i = 0; i <= 6; i++) {
				let weekend = false;
				let non_bank_holiday = false;
				let holiday = "";
				let past = false;
				let whoisout: string[] = [];
				if (current_day.getDay() == 0 || current_day.getDay() == 6) {
					weekend = true;
				} else if (current_day < today) {
					past = true;
				} else {
					const holiday_string = getHolidayDayString(current_day);
					if (allUsHolidays[holiday_string]) {
						holiday =
							allUsHolidays[holiday_string];
					} else {
						Object.keys(users).forEach((user_id) => {
							const user = possibleUsersGroups.users[user_id];
							if (
								user &&
								user.vacations &&
								user.vacations.includes(holiday_string)
							) {
								whoisout.push(user.name);
							}
						});
					}
					if (allNonBankHolidays[holiday_string]) {
						non_bank_holiday = true;
						holiday =
							allNonBankHolidays[holiday_string];
					}
				}
				row.push({
					day: new Date(current_day),
					holiday: holiday,
					nonBankholiday: non_bank_holiday,
					weekend: weekend,
					whoisout: whoisout,
					past: past,
				});
				current_day.setDate(current_day.getDate() + 1);
				current_day.setHours(0, 0, 0, 0);
			}
			rows.push(row);
		}
		return rows;
	};
	useEffect(() => {
		rows = getRows();
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (groups.length) {
			newSearchParams.set("groups", groups.join(","));
		} else {
			newSearchParams.delete("groups");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [groups]);
	rows = getRows();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		if (event.target.checked) {
			// Add the value if checked
			setGroups((prev) => [...prev, value]);
		} else {
			// Remove the value if unchecked
			setGroups((prev) => prev.filter((item) => item !== value));
		}
	};

	return (
		<>
			{!isDashboard && (
				<FormGroup>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							minHeight: "3em",
						}}
					>
						{possibleUsersGroups.groups.map((option, index) => (
							<FormControlLabel
								key={index}
								control={
									<Checkbox
										checked={groups.includes(option)}
										onChange={handleChange}
										name={option}
										value={option}
									/>
								}
								label={option}
								sx={{ display: "inline" }}
							/>
						))}
					</div>
				</FormGroup>
			)}
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<EstimatorCell isOff={true}>S</EstimatorCell>
							<EstimatorCell>M</EstimatorCell>
							<EstimatorCell>T</EstimatorCell>
							<EstimatorCell>W</EstimatorCell>
							<EstimatorCell>T</EstimatorCell>
							<EstimatorCell>F</EstimatorCell>
							<EstimatorCell isOff={true}>S</EstimatorCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={getDateString(row[0].day)}>
								{row.map((cell) => (
									<EstimatorCell
										key={getDateString(cell.day)}
										isOff={
											!!cell.past ||
											(!!cell.holiday && !cell.nonBankholiday) ||
											!!cell.weekend
										}
										isDone={false}
										isPartial={cell.nonBankholiday}
									>
										{getDateString(cell.day)}
										<br />
										{cell.holiday}
										{!!cell.holiday && !!cell.whoisout.length && (
											<br />
										)}
										{cell.whoisout.map(
											(item, index) => (
												<React.Fragment
													key={index}
												>
													<br />
													{item}
												</React.Fragment>
											),
										)}
									</EstimatorCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}

export default WhoIsOutPage;
