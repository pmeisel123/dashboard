import holidays from 'date-holidays';
import type {UsersGroupProps} from '@src/Api'
import {Table, TableBody, TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import {EstimatorCell, getHolidayDayString, getDateString} from './const';


interface cellData {
	day: Date,
	working: number,
	workleft: number,
	description: string,
	title: string,
};

const Calendar: React.FC<{
	possibleUsersGroups: UsersGroupProps,
	users: Set<string>,
	group: string,
	totalTimEstimate: number,
}> = ({possibleUsersGroups, users, group, totalTimEstimate}) => {
	if (!Object.keys(possibleUsersGroups.users).length) {
		return (<></>);
	}
	const hd = new holidays('US'); // For United States
	const today = new Date();
	const nextyear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
	// Get holidays for a specific year
	const usHolidays = hd.getHolidays(today.getFullYear().toString()).filter(holiday => {
		if (holiday.type === 'public' || holiday.type === 'bank') {
			return (holiday.end >= today);
		}
		return false;
	});
	const nextYearUsHolidays = hd.getHolidays(nextyear.getFullYear().toString()).filter(holiday => {
		if (holiday.type === 'public' || holiday.type === 'bank') {
			return (holiday.start <= nextyear);
		}
		return false;
	});

	const allUsHolidays = [...usHolidays, ...nextYearUsHolidays].reduce((newFormat, holiday) => {
		newFormat[holiday.date] = holiday.name;
		return newFormat;
	}, {} as Record<string, string>);
	console.log(allUsHolidays);

	const current_day = new Date();
	current_day.setDate(current_day.getDate() - current_day.getDay());
	let local_users = users;
	let user_count = local_users.size;
	if (!user_count) {
		if (group) {
			local_users = new Set(Object.keys(possibleUsersGroups.users).filter(key => {
				return possibleUsersGroups.users[key].groups && possibleUsersGroups.users[key].groups.includes(group)
			}));
		} else { 
			local_users = new Set(Object.keys(possibleUsersGroups.users));
		}
	}
	user_count = local_users.size;
	let remainingTimEstimate = totalTimEstimate;
	let rows:cellData[][] = [];
	current_day.setHours(0, 0, 0, 0);
	let extra = true;
	let max_rows = 30;
	let last_day = '';
	while ((remainingTimEstimate > 0 || extra) && max_rows) {
		max_rows--;
		if (!remainingTimEstimate) {
			extra = false;
		}
		let row: cellData[] = [];
		for(var i = 0; i <= 6; i++) {
			let title = '';
			let description = '';
			let working = 0;
			 if (!remainingTimEstimate) {
				description = '-';
			} else if(current_day.getDay() == 0 || current_day.getDay() == 6) {
				description = 'Weekend';
			} else if (current_day < today) {
				working = 0
			} else {
				const holiday_string = getHolidayDayString(current_day);
				if (allUsHolidays[holiday_string]) {
					description = allUsHolidays[getHolidayDayString(current_day)];
					title = description;
				} else {
					local_users.forEach((user_id) => {
						const user = possibleUsersGroups.users[user_id];
						if (!user || !user.vacations || !user.vacations.includes(holiday_string)) {
							working++;
							title += user.name + "\n";
						}
					});
					if (!working) {
						description = 'Vacation';
					}
				}
				remainingTimEstimate -= working;
				if (remainingTimEstimate < 0) {
					last_day = getDateString(current_day);
					remainingTimEstimate = 0;
				}
				if(!remainingTimEstimate) {
					description = 'WORK COMPLETE!!!';
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

	//console.log(allUsHolidays);
	return (
		<>
			Complete: {last_day}<br />
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
										isPartial={cell.working && cell.working != user_count}
									>
										{
											cell.description ? 
												<>
													{getDateString(cell.day)}<br />{cell.description}
												</> :
												<>
													{getDateString(cell.day)}<br />
													Working: {cell.working}<br />
													Work Left: {cell.workleft}
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
	);
};

export default Calendar;