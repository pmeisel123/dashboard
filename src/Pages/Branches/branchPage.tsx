import { Box } from "@mui/material";
import type { AppDispatch, RootState, TicketProps } from "@src/Api";
import { fetchBranches, fetchConfig, fetchTickets, fetchUsersAndGroups, isSliceRecent } from "@src/Api";
import { BranchesTable, UserSelector } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const BranchesPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride || undefined);
	const ticketsBranches = useSelector((state: RootState) => state.gitBranchState);
	const allJiraUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const dispatch = useDispatch<AppDispatch>();
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const [ticketKeys, setTicketKeys] = useState<{ [key: string]: TicketProps }>({});
	const [group, setGroup] = useState<string>(searchParams.get("group") || "");
	const [user, setUser] = useState<string>(searchParams.get("user") || "");
	const [loaded, setLoaded] = useState<boolean>(false);
	const config = useSelector((state: RootState) => state.configState);

	const loadParams = () => {
		setGroup(searchParams.get("group") || "");
		setUser(searchParams.get("user") || "");
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		if (!searchParamsOveride) {
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
		}
	}, [group, user]);

	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
		if (!isSliceRecent(ticketsBranches)) {
			dispatch(fetchBranches(config));
		}
		if (!isSliceRecent(allJiraUsersGroups) && config.API_URL) {
			dispatch(fetchUsersAndGroups(config));
		}
	}, [dispatch]);
	useEffect(() => {
		let jira_search = "";
		if (ticketsBranches && ticketsBranches.tickets && Object.keys(ticketsBranches.tickets).length) {
			jira_search = 'key IN ("' + Object.keys(ticketsBranches.tickets).join('", "') + '")';
		}
		if (!config.API_URL) {
			setLoaded(true);
		}
		if (jira_search && config.API_URL) {
			setJiraSearch(jira_search);
			dispatch(fetchTickets([jira_search, config])).then((data) => {
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
		if (config.API_URL) {
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
		} else {
			setLoaded(true);
		}
	}, [tickets]);

	return (
		<Box sx={{ width: "100%" }}>
			{!!config.API_URL && (
				<UserSelector
					allJiraUsersGroups={allJiraUsersGroups}
					group={group}
					setGroup={setGroup}
					user={user}
					setUser={setUser}
				/>
			)}
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
};

export default BranchesPage;
