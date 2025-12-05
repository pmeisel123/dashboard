import type { AppDispatch, RootState, TicketProps } from "@src/Api";
import { fetchTickets, fetchUsersAndGroups, isUserDataRecent } from "@src/Api";
import { TicketTable, UserSelector } from "@src/Components";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

declare const __DONE_STATUS__: string[];

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
	const dispatch = useDispatch<AppDispatch>();

	const loadParams = () => {
		setGroup(searchParams.get("group") || window.localStorage.getItem("group") || "");
		setUser(searchParams.get("user") || window.localStorage.getItem("user") || "");
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	var getFunc = function () {
		if (!user) {
			setJiraSearch("");
		}
		const jira_search = "assignee = " + user + ' AND status NOT IN ("' + __DONE_STATUS__.join('","') + '")';
		setJiraSearch(jira_search);
		setLoading(!ticketsSelector[jira_search] || !ticketsSelector[jira_search].length);
		dispatch(fetchTickets(jira_search)).then(() => {
			setLoading(false);
		});
	};
	useEffect(() => {
		if (!isUserDataRecent(possibleUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);

	useEffect(() => {
		if (user && hasFetchedTickets.current != user) {
			getFunc();
			hasFetchedTickets.current = user;
		}
	}, [user]);
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
				/>
			)}
		</>
	);
}

export default MyTicketsPage;
