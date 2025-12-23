import { Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import type { HolidayProps, UsersGroupProps } from "@src/Api";
import { getAllUsHolidays, getDateString, getHolidayDayString } from "@src/Api";
import { allGroups } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { EstimatorCell } from "./const";

interface cellData {
	day: Date;
	working: number;
	workleft: number;
	description: string;
	title: string;
}

const Calendar: FC<{
	allJiraUsersGroups: UsersGroupProps;
	users: Set<string>;
	group: string;
	totalTimEstimate: number;
	visibleUsers: Set<string>;
	isDashboard?: boolean;
	setLastDay: Dispatch<SetStateAction<string>>;
}> = ({ allJiraUsersGroups, users, group, totalTimEstimate, visibleUsers, isDashboard, setLastDay }) => {
	if (!Object.keys(allJiraUsersGroups.users).length) {
		return <></>;
	}
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const nextyear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
	// Get holidays for a specific year
	const thisYearUsHolidays = getAllUsHolidays(today.getFullYear().toString()).filter((holiday) => {
		return new Date(holiday.date) >= today;
	});
	const nextYearUsHolidays = getAllUsHolidays(nextyear.getFullYear().toString()).filter((holiday) => {
		return new Date(holiday.date) <= nextyear;
	});

	const usHolidays = [...thisYearUsHolidays, ...nextYearUsHolidays].reduce(
		(newFormat, holiday) => {
			newFormat[holiday.date] = holiday;
			return newFormat;
		},
		{} as Record<string, HolidayProps>,
	);

	const current_day = new Date();
	current_day.setDate(current_day.getDate() - current_day.getDay());
	current_day.setHours(0, 0, 0, 0);
	let local_users = users;
	let user_count = local_users.size;
	if (!user_count) {
		if (group && group != allGroups) {
			local_users = new Set(
				Object.keys(allJiraUsersGroups.users).filter((key) => {
					return allJiraUsersGroups.users[key].groups && allJiraUsersGroups.users[key].groups.includes(group);
				}),
			);
		} else {
			local_users = visibleUsers;
		}
	}
	user_count = local_users.size;
	let remainingTimEstimate = totalTimEstimate;
	let rows: cellData[][] = [];
	let extra = true;
	let max_rows = 30;
	while ((remainingTimEstimate > 0 || extra) && max_rows) {
		max_rows--;
		if (!remainingTimEstimate) {
			extra = false;
		}
		let row: cellData[] = [];
		for (var i = 0; i <= 6; i++) {
			let title = "";
			let off = "";
			let description = "";
			let working = 0;
			if (!remainingTimEstimate) {
				description = "-";
			} else if (current_day.getDay() == 0 || current_day.getDay() == 6) {
				description = "Weekend";
			} else if (current_day < today) {
				working = 0;
			} else {
				const holiday_string = getHolidayDayString(current_day);
				let skip = false;
				const holiday = usHolidays[holiday_string];
				if (holiday) {
					description = holiday.name;
					title = description;
					if (holiday.bank) {
						skip = true;
					} else {
						title += "\n\n";
					}
				}
				if (!skip) {
					local_users.forEach((user_id) => {
						const user = allJiraUsersGroups.users[user_id];
						if (!user || !user.vacations || !user.vacations.includes(holiday_string)) {
							working++;
							if (user) {
								if (!title) {
									title = "Working:\n";
								}
								title += user.name + "\n";
							}
						} else {
							if (user) {
								if (!off) {
									off = "Off:\n";
								}
								off += user.name + "\n";
							}
						}
					});
					if (!working) {
						description = "Vacation";
					} else {
						if (off) {
							if (title) {
								title += "\n";
							}
							title += off;
						}
					}
				}
				remainingTimEstimate -= working;
				if (remainingTimEstimate < 0) {
					remainingTimEstimate = 0;
				}
				if (!remainingTimEstimate) {
					setLastDay(getDateString(current_day));
					description = "WORK COMPLETE!!!";
				}
			}
			row.push({
				day: new Date(current_day),
				working: working,
				workleft: remainingTimEstimate,
				description: description,
				title: title,
			});
			current_day.setDate(current_day.getDate() + 1);
			current_day.setHours(0, 0, 0, 0);
		}
		rows.push(row);
	}

	return (
		<>
			{!isDashboard && (
				<>
					<br />
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
												title={cell.title}
												isOff={!cell.working}
												isDone={!!cell.working && !cell.workleft}
												isPartial={cell.working && cell.working != user_count ? true : false}
											>
												{getDateString(cell.day)}
												{!!cell.description && (
													<>
														<br />
														{cell.description}
														{!!cell.working && <br />}
													</>
												)}
												{!!cell.working && (
													<>
														<br />
														Working: {cell.working}
														<br />
														Work Left: {cell.workleft}
													</>
												)}
											</EstimatorCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			)}
		</>
	);
};

export default Calendar;
