import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import { Select, MenuItem, InputLabel} from '@mui/material';
import {getHolidays, getDateStringWithDayOfWeek} from '@src/Api';
import {Table, TableBody, TableCell,  TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import {DateRow} from './const';


const HolidayPage = (() => {
	const this_year = (new Date().getFullYear() + '');
	const [searchParams, setSearchParams] = useSearchParams();
	const [year, setYear] = useState<string>(searchParams.get('year') || this_year);
	const year_as_int = parseInt(year);

	let years_choices: string[] = [];
	for(let val = year_as_int - 10; val <= year_as_int + 10; val++) {
		years_choices.push(val + '');
	}

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (year != this_year) {
			newSearchParams.set('year', year);
		} else {
			newSearchParams.delete('year');
		}
		setSearchParams(newSearchParams);
	}, [year]);
	const usHolidays = getHolidays(year);
	console.log(usHolidays);
	return (
		<>
			<InputLabel id="Year">Year</InputLabel>
			<Select
				label="Year"
				value={year}
				onChange={(event) => {
					setYear(event.target.value);
				}}
				sx={{minWidth: 100}}
			>
				{
					years_choices.map((year) => 
						<MenuItem key={year} value={year}>{year}</MenuItem>
					)
				}
			</Select>
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							usHolidays.map((holiday) =>
								<DateRow date={holiday.date}>
									<TableCell>{holiday.name}</TableCell>
									<TableCell>{getDateStringWithDayOfWeek(new Date(holiday.date))}</TableCell>
								</DateRow>
							)
						}
					</TableBody>
				</Table>
			</TableContainer>
				
		</>
	);
});
export default HolidayPage;