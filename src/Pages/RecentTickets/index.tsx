import {
	Button,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import type { AppDispatch, RootState, TicketProps } from "@src/Api";
import { fetchTickets, getJiraDayString } from "@src/Api";
import { TicketTable } from "@src/Components";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";

const default_days = 5;

function RecentTicketsPage() {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const getParamDays = () => {
		return parseInt(searchParams.get("days") || default_days + "");
	};
	const getParamSearch = () => {
		return searchParams.get("search") || "";
	};

	const [days, setDays] = useState<number>(getParamDays());
	const [search, setSearch] = useState<string>(getParamSearch());
	const [loading, setLoading] = useState<boolean>(true);
	const ticketsSelector = useSelector(
		(state: RootState) => state.ticketsState,
	);
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector(
		(state: RootState) => state.ticketsState[jiraSearch],
	);
	const dispatch = useDispatch<AppDispatch>();

	const getFunc = function () {
		var jira_search = "";
		if (search) {
			jira_search = search + " AND ";
		}
		jira_search += 'created >= "';
		let past_date = new Date();
		past_date.setDate(past_date.getDate() - days);
		jira_search += getJiraDayString(past_date) + '"';
		setJiraSearch(jira_search);
		setLoading(
			!ticketsSelector[jira_search] ||
				!ticketsSelector[jira_search].length,
		);
		dispatch(fetchTickets(jira_search)).then(() => {
			setLoading(false);
		});
	};
	useEffect(() => {
		const new_days = getParamDays();
		const new_search = getParamSearch();
		if (new_days != days || new_search != search) {
			setDays(new_days);
			setSearch(new_search);
		}
		setLoading(true);
		0;
	}, [searchParams]);
	useEffect(() => {
		if (loading) {
			const newSearchParams = new URLSearchParams(
				searchParams.toString(),
			);
			if (days != default_days) {
				newSearchParams.set("days", days + "");
			} else {
				newSearchParams.delete("days");
			}
			if (search != "") {
				newSearchParams.set("search", search);
			} else {
				newSearchParams.delete("search");
			}
			if (searchParams.toString() != newSearchParams.toString()) {
				setSearchParams(newSearchParams);
			}
			getFunc();
		}
	}, [loading]);
	let totalTimEstimate = tickets.reduce(
		(sum, row) => sum + (row.timeestimate || 0),
		0,
	);
	let totalTimeOriginalEstimate = tickets.reduce(
		(sum, row) => sum + (row.timeoriginalestimate || 0),
		0,
	);
	let totalTimeSpent = tickets.reduce(
		(sum, row) => sum + (row.timespent || 0),
		0,
	);
	return (
		<>
			{!isDashboard && (
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
					<Grid size={{ xs: 12, md: 3 }}>
						<InputLabel id="Days Agao">Days Ago</InputLabel>
						<Select
							label="Days Ago"
							value={days}
							onChange={(event) => {
								setDays(event.target.value);
							}}
							sx={{ minWidth: 100 }}
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
							disabled={
								getParamDays() == days &&
								getParamSearch() == search
							}
						>
							Update
						</Button>
					</Grid>
				</Grid>
			)}
			{
				<TicketTable
					tickets={tickets}
					defaultEstimate={null}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
					isDashboard={isDashboard}
					defaultSort={"created"}
					defaultSortDirection={"desc"}
				/>
			}
		</>
	);
}

export default RecentTicketsPage;
