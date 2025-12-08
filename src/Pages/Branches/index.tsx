import { Box } from "@mui/material";
import type { AppDispatch, BranchesAndTicket, RootState, TicketProps, UsersGroupPropsSlice } from "@src/Api";
import { fetchBranches, fetchTickets, fetchUsersAndGroups, isGitDataRecent, isUserDataRecent } from "@src/Api";
import { BranchesTable, UserSelector } from "@src/Components";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function BranchesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const ticketsBranches: BranchesAndTicket = useSelector((state: RootState) => state.gitBranchState);
	const allJiraUsersGroups: UsersGroupPropsSlice = useSelector((state: RootState) => state.usersAndGroupsState);
	const dispatch = useDispatch<AppDispatch>();
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const [ticketKeys, setTicketKeys] = useState<{ [key: string]: TicketProps }>({});
	const [group, setGroup] = useState<string>(searchParams.get("group") || "");
	const [user, setUser] = useState<string>(searchParams.get("user") || "");
	const [loaded, setLoaded] = useState<boolean>(false);

	const loadParams = () => {
		setGroup(searchParams.get("group") || "");
		setUser(searchParams.get("user") || "");
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (group != "") {
			newSearchParams.set("group", group);
		} else {
			newSearchParams.delete("group");
		}
		if (user != "") {
			newSearchParams.set("user", user);
		} else {
			newSearchParams.delete("user");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [group, user]);

	useEffect(() => {
		if (!isGitDataRecent(ticketsBranches)) {
			dispatch(fetchBranches());
		}
		if (!isUserDataRecent(allJiraUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);
	useEffect(() => {
		let jira_search = "";
		if (ticketsBranches && ticketsBranches.tickets && Object.keys(ticketsBranches.tickets).length) {
			jira_search = 'key IN ("' + Object.keys(ticketsBranches.tickets).join('", "') + '")';
		}
		if (jira_search) {
			setJiraSearch(jira_search);
			dispatch(fetchTickets(jira_search)).then((data) => {
				if (data && data.payload) {
					const payload = data.payload as TicketProps[];
					if (!payload.length) {
						setLoaded(true);
					}
				}
			});
		} else {
			if (ticketsBranches.branches.length) {
				setLoaded(true);
			}
		}
	}, [ticketsBranches]);
	useEffect(() => {
		if (tickets) {
			tickets.forEach((ticket) => {
				const key = ticket.key;
				setTicketKeys((ticketKeys) => {
					ticketKeys[key] = ticket;
					return ticketKeys;
				});
			});
			if (Object.keys(ticketKeys).length) {
				setLoaded(true);
			}
		}
	}, [tickets]);

	return (
		<Box sx={{ width: "100%" }}>
			<UserSelector
				allJiraUsersGroups={allJiraUsersGroups}
				group={group}
				setGroup={setGroup}
				user={user}
				setUser={setUser}
			/>
			<BranchesTable
				loaded={loaded}
				ticketsBranches={ticketsBranches}
				allJiraUsersGroups={allJiraUsersGroups}
				ticketKeys={ticketKeys}
				group={group}
				user={user}
			/>
		</Box>
	);
}

export default BranchesPage;
