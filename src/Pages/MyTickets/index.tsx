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
const UserFields: string[] = [];
Object.keys(__CUSTOM_FIELDS__).forEach((custom_field_key) => {
	if (__CUSTOM_FIELDS__[custom_field_key].Type == "User") {
		UserFields.push(custom_field_key);
	}
});

function MyTicketsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const possibleUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const [group, setGroup] = useState<string>(searchParams.get("group") || window.localStorage.getItem("group") || "");
	const [user, setUser] = useState<string>(searchParams.get("user") || window.localStorage.getItem("user") || "");
	const [loading, setLoading] = useState<boolean>(true);
	const ticketsSelector = useSelector((state: RootState) => state.ticketsState);
	const hasFetchedTickets = useRef("");
	const ticketsBranches = useSelector((state: RootState) => state.gitBranchState);
	const dispatch = useDispatch<AppDispatch>();

	const loadParams = () => {
		setGroup(searchParams.get("group") || window.localStorage.getItem("group") || "");
		setUser(searchParams.get("user") || window.localStorage.getItem("user") || "");
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
		let user_search = "assignee = " + user;
		if (UserFields.length) {
			user_search = "(assignee = " + user;
			UserFields.forEach((field) => {
				user_search += " || " + field + " = " + user;
			});
			user_search += ")";
		}
		let ticket_search = "";
		if (Object.keys(ticketsBranches.branches).length && Object.keys(possibleUsersGroups.users).length) {
			Object.keys(ticketsBranches.branches).forEach((repo) => {
				ticketsBranches.branches[repo].forEach((branch) => {
					if (branch.creator && branch.ticket) {
						const branch_user = GetBranchCreator(branch.creator, possibleUsersGroups);
						if (branch_user && branch_user.id == user) {
							ticket_search += ' || key = "' + branch.ticket + '"';
						}
					}
				});
			});
		}
		let jira_search = user_search + ' AND status NOT IN ("' + __DONE_STATUS__.join('","') + '")';
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
	}, [possibleUsersGroups, ticketsBranches]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (group == window.localStorage.getItem("group") && user == window.localStorage.getItem("user")) {
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
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [group, user]);
	let totalTimEstimate = tickets.reduce((sum, row) => sum + (row.timeestimate || 0), 0);
	let totalTimeOriginalEstimate = tickets.reduce((sum, row) => sum + (row.timeoriginalestimate || 0), 0);
	let totalTimeSpent = tickets.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			<UserSelector
				possibleUsersGroups={possibleUsersGroups}
				group={group}
				setGroup={setGroup}
				user={user}
				setUser={setUser}
			/>
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
