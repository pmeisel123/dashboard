import { Box } from "@mui/material";
import type { AppDispatch, BranchesAndTicket, RootState, TicketProps, UsersGroupPropsSlice } from "@src/Api";
import { fetchBranches, fetchTickets, fetchUsersAndGroups, isGitDataRecent, isUserDataRecent } from "@src/Api";
import { BranchesTable } from "@src/Components";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function BranchesPage() {
	const ticketsBranches: BranchesAndTicket = useSelector((state: RootState) => state.gitBranchState);
	const possibleUsersGroups: UsersGroupPropsSlice = useSelector((state: RootState) => state.usersAndGroupsState);
	const dispatch = useDispatch<AppDispatch>();
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const [ticketKeys, setTicketKeys] = useState<{ [key: string]: TicketProps }>({});
	const [loaded, setLoaded] = useState<boolean>(false);

	useEffect(() => {
		if (!isGitDataRecent(ticketsBranches)) {
			dispatch(fetchBranches());
		}
		if (!isUserDataRecent(possibleUsersGroups)) {
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
			<BranchesTable
				loaded={loaded}
				ticketsBranches={ticketsBranches}
				possibleUsersGroups={possibleUsersGroups}
				ticketKeys={ticketKeys}
			/>
		</Box>
	);
}

export default BranchesPage;
