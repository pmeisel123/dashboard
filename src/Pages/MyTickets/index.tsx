import type { SelectChangeEvent } from "@mui/material";
import { Checkbox, Grid, InputLabel, ListItemText, MenuItem, Select } from "@mui/material";
import type { AppDispatch, CustomFieldsProps, ReportNamePaths, RootState, TicketProps } from "@src/Api";
import {
	fetchBranches,
	fetchTickets,
	fetchUsersAndGroups,
	GetBranchCreator,
	isGitDataRecent,
	isUserDataRecent,
} from "@src/Api";
import { TicketTable, UserSelector } from "@src/Components";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

declare const __DONE_STATUS__: string[];
declare const __GIT_REPOS_PATHS__: { [key: string]: ReportNamePaths };
declare const __CUSTOM_FIELDS__: { [key: string]: CustomFieldsProps };
const allUserFieldsMap: { [key: string]: string } = {
	assignee: "Assignee",
	creator: "Creator",
	git: "Git Branches Owner",
};
const allUserFieldsDefault: { [key: string]: boolean } = {
	assignee: true,
	creator: false,
	git: true,
};
Object.keys(__CUSTOM_FIELDS__).forEach((custom_field_key) => {
	if (__CUSTOM_FIELDS__[custom_field_key].Type == "User") {
		allUserFieldsMap[custom_field_key] = __CUSTOM_FIELDS__[custom_field_key].Name;
		allUserFieldsDefault[custom_field_key] = true;
	}
});
const allUserFieldsDefaultArray = Object.keys(allUserFieldsDefault).filter((key) => allUserFieldsDefault[key]);

function MyTicketsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const possibleUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const [group, setGroup] = useState<string>(searchParams.get("group") || window.localStorage.getItem("group") || "");
	const [user, setUser] = useState<string>(searchParams.get("user") || window.localStorage.getItem("user") || "");
	const [loading, setLoading] = useState<boolean>(true);
	let user_fields_params = searchParams.get("user_fields") || window.localStorage.getItem("user_fields");
	let user_field_load = allUserFieldsDefaultArray;
	if (user_fields_params) {
		user_field_load = user_fields_params.split(",");
	}
	const [userFields, setUserFields] = useState<string[]>(user_field_load);
	const ticketsSelector = useSelector((state: RootState) => state.ticketsState);
	const hasFetchedTickets = useRef("");
	const ticketsBranches = useSelector((state: RootState) => state.gitBranchState);
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const dispatch = useDispatch<AppDispatch>();

	const loadParams = () => {
		setGroup(searchParams.get("group") || window.localStorage.getItem("group") || "");
		setUser(searchParams.get("user") || window.localStorage.getItem("user") || "");
		let user_fields_params = searchParams.get("user_fields") || window.localStorage.getItem("user_fields");
		if (user_fields_params) {
			let user_field_load = user_fields_params.split(",");
			setUserFields(user_field_load);
		}
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		if (!isUserDataRecent(possibleUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
		if (!isGitDataRecent(ticketsBranches)) {
			dispatch(fetchBranches());
		}
	}, [dispatch]);

	var getFunc = function () {
		if (!user) {
			setJiraSearch("");
		}
		let search = "";
		userFields.forEach((field) => {
			if (field != "git") {
				if (search) {
					search += " OR ";
				}
				search += field + " = " + user;
			}
		});
		let ticket_search = "";
		if (
			userFields.includes("git") &&
			Object.keys(ticketsBranches.branches).length &&
			Object.keys(possibleUsersGroups.users).length
		) {
			Object.keys(ticketsBranches.branches).forEach((repo) => {
				ticketsBranches.branches[repo].forEach((branch) => {
					if (branch.creator && branch.ticket) {
						const branch_user = GetBranchCreator(branch.creator, possibleUsersGroups);
						if (branch_user && branch_user.id == user) {
							ticket_search += ' OR key = "' + branch.ticket + '"';
						}
					}
				});
			});
		}
		if (!search && !ticket_search) {
			setJiraSearch("");
			return;
		}
		let jira_search = 'status NOT IN ("' + __DONE_STATUS__.join('","') + '")';
		if (search) {
			jira_search += " AND (" + search + ")";
		}
		if (ticket_search) {
			jira_search = "(" + jira_search + ")" + ticket_search;
		}
		setJiraSearch(jira_search);
		setLoading(!ticketsSelector[jira_search] || !ticketsSelector[jira_search].length);
		dispatch(fetchTickets(jira_search)).then(() => {
			setLoading(false);
		});
	};

	useEffect(() => {
		if (user && hasFetchedTickets.current != user) {
			getFunc();
			hasFetchedTickets.current = user;
		}
	}, [user]);
	useEffect(() => {
		getFunc();
	}, [possibleUsersGroups, ticketsBranches, userFields]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (
			group == window.localStorage.getItem("group") &&
			user == window.localStorage.getItem("user") &&
			userFields == allUserFieldsDefaultArray
		) {
			return;
		}

		if (group != "") {
			newSearchParams.set("group", group);
		} else {
			newSearchParams.delete("group");
		}
		window.localStorage.setItem("group", group);

		if (user != "") {
			newSearchParams.set("user", user);
		} else {
			newSearchParams.delete("user");
		}
		window.localStorage.setItem("user", user);

		if (userFields != allUserFieldsDefaultArray) {
			newSearchParams.set("user_fields", userFields.join(","));
		} else {
			newSearchParams.delete("user_fields");
		}
		window.localStorage.setItem("user_fields", userFields.join(","));

		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [group, user, userFields]);
	let totalTimEstimate = tickets.reduce((sum, row) => sum + (row.timeestimate || 0), 0);
	let totalTimeOriginalEstimate = tickets.reduce((sum, row) => sum + (row.timeoriginalestimate || 0), 0);
	let totalTimeSpent = tickets.reduce((sum, row) => sum + (row.timespent || 0), 0);
	const owerColumnOnChange = (event: SelectChangeEvent<string[]>) => {
		setUserFields(event.target.value as string[]);
	};
	return (
		<>
			<Grid container spacing={2}>
				<Grid>
					<UserSelector
						possibleUsersGroups={possibleUsersGroups}
						group={group}
						setGroup={setGroup}
						user={user}
						setUser={setUser}
					/>
				</Grid>
				<Grid>
					<InputLabel id="Owners">Owners Columns</InputLabel>
					<Select<string[]>
						label="Owners Columns"
						value={userFields}
						multiple
						sx={{ width: "150px" }}
						onChange={owerColumnOnChange}
						renderValue={(selected) => "Selected (" + selected.length + ")"}
					>
						{Object.entries(allUserFieldsMap).map(([key, name]) => (
							<MenuItem key={key} value={key}>
								<Checkbox checked={userFields.includes(key)} />
								<ListItemText primary={name} />
							</MenuItem>
						))}
					</Select>
				</Grid>
			</Grid>
			{user && (
				<TicketTable
					tickets={tickets}
					defaultEstimate={null}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
					user={user}
					possibleUsersGroups={possibleUsersGroups}
					ticketsBranches={ticketsBranches}
				/>
			)}
		</>
	);
}

export default MyTicketsPage;
