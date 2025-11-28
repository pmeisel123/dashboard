import { useState, useEffect } from 'react'
import {getTicketsApi, getJiraDayString} from '@src/Api'
import type {TicketProps} from '@src/Api'
import {TicketTable} from '@src/Components';
import { Select, MenuItem, InputLabel, Grid, TextField, Button} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const default_days = 5;

function RecentTicketsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [days, setDays] = useState<number>(parseInt(searchParams.get('days') || default_days + ''));
	const [search, setSearch] = useState<string>(searchParams.get('search') || '');
	const [loading, setLoading] = useState<boolean>(true);
	const [data, setData] = useState<TicketProps[]>([]);

	var getFunc = function() {
		var jira_search = '';
		if (search) {
			jira_search = search + ' AND ';
		}
		jira_search += 'created >= "';
		let past_date = new Date();
		past_date.setDate(past_date.getDate() - days);
		jira_search += getJiraDayString(past_date) + '"';
		setData([]);
		getTicketsApi(jira_search)
			.then((data: TicketProps[]) => {
				setLoading(false);
				setData(data);
			})
	};
	useEffect(() => {
		if (loading) {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			if (days != default_days) {
				newSearchParams.set('days', days + '');
			} else {
				newSearchParams.delete('days');
			}
			if (search != '') {
				newSearchParams.set('search', search);
			} else {
				newSearchParams.delete('search');
			}
			if(searchParams.toString() != newSearchParams.toString()) {
				setSearchParams(newSearchParams);
			}
			getFunc();
		}
	}, [loading]);
	let totalTimEstimate = data.reduce((sum, row) => sum + (row.timeestimate || 0), 0);
	let totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || 0), 0);
	let totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel id="search">Search</InputLabel>
					<TextField
						id="search"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
				</Grid>
				<Grid  size={{ xs: 12, md: 3 }}>
					<InputLabel id="Days Agao">Days Ago</InputLabel>
					<Select
						label="Days Ago"
						value={days}
						onChange={(event) => {
							setDays(event.target.value);
						}}
						sx={{minWidth: 100}}
					>
						{[...Array(31).keys()].map((days: number) => (
							<MenuItem key={days} value={days}>
								{days}
							</MenuItem>
						))}
					</Select>
				</Grid>
				<Grid size={2}>
					<InputLabel id="parent">&nbsp;</InputLabel>
					<Button
						variant="contained"
						onClick={() => {
							setLoading(true);
						}}
					>
						Update
					</Button>
				</Grid>
			</Grid>
			{
				<TicketTable
					data={data}
					defaultEstimate={null}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
				/>
			}
		</>
	);
}

export default RecentTicketsPage;