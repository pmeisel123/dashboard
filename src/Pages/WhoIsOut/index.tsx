import React, { useState, useEffect, useRef } from 'react'
import {getUsersAndGroupsApi} from '@src/Api'
import type {UsersGroupProps} from '@src/Api'
import {getHolidays, getHolidayDayString, getDateString} from '@src/Api';
import {Table, TableBody, TableContainer, TableHead, TableRow, Paper, Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import {EstimatorCell} from '@src/Components';
import { useSearchParams } from 'react-router-dom';

interface cellData {
	day: Date,
	holiday: string,
	weekend: boolean,
	whoisout: string[],
	past: boolean,
};

function WhoIsOutPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [possibleUsersGroups, setPossibleUsersGroups] = useState<UsersGroupProps>({groups: [], users: {}});
	let param_groups = searchParams.get('groups');
	const [groups, setGroups] = useState<String[]>(param_groups ? param_groups.split(/,/g) : []);
	const hasFetchedUser = useRef(false);

	const loadParams = () => {
		param_groups = searchParams.get('groups');
		setGroups(param_groups ? param_groups.split(/,/g) : []);
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	var getUsers = function() {
		getUsersAndGroupsApi().then((data: UsersGroupProps) => {
			setPossibleUsersGroups(data);
		});
	};

	useEffect(() => {
		if (!hasFetchedUser.current) {
			getUsers();
			hasFetchedUser.current = true;
		}
	}, []);
	const today = new Date();
	const nextyear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
	// Get holidays for a specific year
	const usHolidays = getHolidays(today.getFullYear().toString()).filter(holiday => {
		return (holiday.end >= today);
	});
	const nextYearUsHolidays = getHolidays(nextyear.getFullYear().toString()).filter(holiday => {
		return (holiday.start <= nextyear);
	});

	const allUsHolidays = [...usHolidays, ...nextYearUsHolidays].reduce((newFormat, holiday) => {
		newFormat[holiday.date] = holiday.name;
		return newFormat;
	}, {} as Record<string, string>);
	let rows:cellData[][] = [];

	const current_day = new Date();
	current_day.setDate(current_day.getDate() - current_day.getDay());
	current_day.setHours(0, 0, 0, 0);

	let users = possibleUsersGroups.users;
	const getRows = () => {
		if (groups.length) {
			users = {};
			Object.keys(possibleUsersGroups.users).forEach((user_id) => {
				const user = possibleUsersGroups.users[user_id];
				if (user.groups && user.groups.some(item => groups.includes(item))) {
					users[user_id] = user;
				}
			});
		} else {
			users = possibleUsersGroups.users;
		}
		let rows:cellData[][] = [];
		for(var week = 0; week <= 10; week++) {
			let row: cellData[] = [];
			for(var i = 0; i <= 6; i++) {
				let weekend = false;
				let holiday = '';
				let past = false;
				let whoisout: string[] = [];
				if(current_day.getDay() == 0 || current_day.getDay() == 6) {
					weekend = true
				} else if (current_day < today) {
					past = true;
				} else {
					const holiday_string = getHolidayDayString(current_day);
					if (allUsHolidays[holiday_string]) {
						holiday = allUsHolidays[getHolidayDayString(current_day)];
					} else {
						Object.keys(users).forEach((user_id) => {
							const user = possibleUsersGroups.users[user_id];
							if (user && user.vacations && user.vacations.includes(holiday_string)) {
								whoisout.push(user.name);
							}
						});
					}
				}
				row.push({
					day: new Date(current_day),
					holiday: holiday,
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
			newSearchParams.set('groups', groups.join(','));
		} else {
			newSearchParams.delete('groups');
		}
		setSearchParams(newSearchParams);
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
			<FormGroup>
				<div style={{ display: 'flex', flexDirection: 'row', minHeight: '3em' }}>
					{
						possibleUsersGroups.groups.map((option, index) => (
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
								sx={{display: "inline"}}
							/>
						))
					}
				</div>
			</FormGroup>
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
										isOff={!!cell.past || !!cell.holiday || !!cell.weekend}
										isDone={false}
										isPartial={false}
									>
										{getDateString(cell.day)}<br />
										{
											cell.holiday ? 
												<>
													{cell.holiday}
												</> :
												<>
													{cell.whoisout.map((item, index) => (
														<React.Fragment key={index}>
															<br />{item}
														</React.Fragment>
													))}
												</>
									 	}
								 	</EstimatorCell>
							 	))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	)
}

export default WhoIsOutPage;