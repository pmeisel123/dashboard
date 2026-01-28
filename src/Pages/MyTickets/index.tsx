import type { SelectChangeEvent } from "@mui/material";
import { Checkbox, Grid, InputLabel, ListItemText, MenuItem, Select } from "@mui/material";
import type { AppDispatch, RootState, RoutePageProps, TicketProps } from "@src/Api";
import {
	fetchBranches,
	fetchConfig,
	fetchTickets,
	fetchUsersAndGroups,
	GetBranchCreator,
	isSliceRecent,
} from "@src/Api";
import { TicketTable, UserSelector } from "@src/Components";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const MyTicketsPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride || undefined);
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const allJiraUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const [group, setGroup] = useState<string>(searchParams.get("group") || window.localStorage.getItem("group") || "");
	const [user, setUser] = useState<string>(searchParams.get("user") || window.localStorage.getItem("user") || "");
	const [loading, setLoading] = useState<boolean>(true);
	const [allUserFieldsMap, setAllUserFieldsMap] = useState<{ [key: string]: string }>({});
	const [allUserFieldsDefaultArray, setAllUserFieldsDefaultArray] = useState<string[]>([]);
	const [userFields, setUserFields] = useState<string[]>([]);
	const ticketsSelector = useSelector((state: RootState) => state.ticketsState);
	const hasFetchedTickets = useRef("");
	const ticketsBranches = useSelector((state: RootState) => state.gitBranchState);
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const config = useSelector((state: RootState) => state.configState);
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
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
		if (!isSliceRecent(allJiraUsersGroups)) {
			dispatch(fetchUsersAndGroups(config));
		}
		if (!isSliceRecent(ticketsBranches)) {
			dispatch(fetchBranches(config));
		}
	}, [dispatch]);
	useEffect(() => {
		const newAllUserFieldsMap: { [key: string]: string } = {
			assignee: "Assignee",
			creator: "Creator",
			git: "Git Branches Owner",
		};
		const newAllUserFieldsDefault: { [key: string]: boolean } = {
			assignee: true,
			creator: false,
			git: true,
		};
		const newAllUserFieldsDefaultArray = Object.keys(newAllUserFieldsDefault).filter(
			(key) => newAllUserFieldsDefault[key],
		);
		Object.keys(config.CUSTOM_FIELDS).forEach((custom_field_key) => {
			if (config.CUSTOM_FIELDS[custom_field_key].Type == "User") {
				newAllUserFieldsMap[custom_field_key] = config.CUSTOM_FIELDS[custom_field_key].Name;
				newAllUserFieldsDefault[custom_field_key] = true;
			}
		});
		let user_fields_params = searchParams.get("user_fields") || window.localStorage.getItem("user_fields");
		let user_field_load = newAllUserFieldsDefaultArray;
		if (user_fields_params) {
			user_field_load = user_fields_params.split(",");
		}
		setUserFields(user_field_load);
		setAllUserFieldsMap(newAllUserFieldsMap);
		setAllUserFieldsDefaultArray(newAllUserFieldsDefaultArray);
	}, [config]);

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
			Object.keys(allJiraUsersGroups.users).length
		) {
			Object.keys(ticketsBranches.branches).forEach((repo) => {
				ticketsBranches.branches[repo].forEach((branch) => {
					if (branch.creator && branch.ticket) {
						const branch_user = GetBranchCreator(branch.creator, allJiraUsersGroups);
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
		let jira_search = 'status NOT IN ("' + config.DONE_STATUS.join('","') + '")';
		if (search) {
			jira_search += " AND (" + search + ")";
		}
		if (ticket_search) {
			jira_search = "(" + jira_search + ")" + ticket_search;
		}
		setJiraSearch(jira_search);
		setLoading(!ticketsSelector[jira_search] || !ticketsSelector[jira_search].length);
		dispatch(fetchTickets([jira_search, config])).then(() => {
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
	}, [allJiraUsersGroups, ticketsBranches, userFields]);
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
						allJiraUsersGroups={allJiraUsersGroups}
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
					allJiraUsersGroups={allJiraUsersGroups}
					ticketsBranches={ticketsBranches}
				/>
			)}
		</>
	);
};

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/MyTickets",
		name: "My Tickets",
		element: <MyTicketsPage />,
		description: (
			<>View tickets assigned to a specific user. The selected user is saved to local storage for convenience.</>
		),
		requires: "APIURL",
	},
];
