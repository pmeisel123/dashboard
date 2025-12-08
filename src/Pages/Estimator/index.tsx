import type { AppDispatch, RootState, TicketProps } from "@src/Api";
import { fetchBranches, fetchTickets, fetchUsersAndGroups, isGitDataRecent, isUserDataRecent } from "@src/Api";
import { allGroups, Calendar, FormFields, TicketTable, UsersSelector } from "@src/Components";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";

const defaultDefaultDefaultEstimate = 2;

function EstimatorPage() {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams();
	let defaultDefaultEstimate: number = parseInt(
		searchParams.get("defaultEstimate") || defaultDefaultDefaultEstimate + "",
	);
	const ticketsSelector = useSelector((state: RootState) => state.ticketsState);
	const [search, setSearch] = useState<string>(searchParams.get("search") || "");
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch]);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(defaultDefaultEstimate);
	const [parent, setParent] = useState<string>(searchParams.get("parent") || "");
	const [estimatePadding, setEstimatePadding] = useState<number>(
		parseFloat(searchParams.get("estimatePadding") || "0"),
	);
	const possibleUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const [group, setGroup] = useState<string>(searchParams.get("group") || allGroups);
	let user_param = searchParams.get("users") || "";
	const [users, setUsers] = useState<Set<string>>(new Set(user_param.split(",")));
	const [visibleUsers, setVisibleUsers] = useState<Set<string>>(new Set());
	const freezeParams = useRef(false);
	const ticketsBranches = useSelector((state: RootState) => state.gitBranchState);
	const dispatch = useDispatch<AppDispatch>();

	const loadParams = () => {
		defaultDefaultEstimate = parseInt(searchParams.get("defaultEstimate") || defaultDefaultDefaultEstimate + "");
		setDefaultEstimate(defaultDefaultEstimate);
		setSearch(searchParams.get("search") || "");
		setParent(searchParams.get("parent") || "");
		setEstimatePadding(parseFloat(searchParams.get("estimatePadding") || "0"));
		setGroup(searchParams.get("group") || allGroups);
		user_param = searchParams.get("users") || "";
		setUsers(new Set(user_param.split(",")));
	};

	useEffect(() => {
		freezeParams.current = true;
		loadParams();
		setTimeout(function () {
			freezeParams.current = false;
		});
	}, [searchParams]);

	var getFunc = function () {
		var jira_search = "";
		if (search && parent) {
			jira_search = search + " AND parent=" + parent;
		} else if (!search && parent) {
			jira_search = "parent = " + parent;
		} else {
			jira_search = search;
		}
		if (!jira_search) {
			setJiraSearch("");
			return;
		}
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
		if (!isGitDataRecent(ticketsBranches)) {
			dispatch(fetchBranches());
		}
		getFunc();
	}, [dispatch]);
	useEffect(() => {
		if (search || parent) {
			getFunc();
		}
	}, [search, parent]);
	useEffect(() => {
		if (freezeParams.current) {
			return;
		}
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (defaultEstimate != defaultDefaultDefaultEstimate) {
			newSearchParams.set("defaultEstimate", defaultEstimate + "");
		} else {
			newSearchParams.delete("defaultEstimate");
		}
		if (search != "") {
			newSearchParams.set("search", search);
		} else {
			newSearchParams.delete("search");
		}
		if (parent != "") {
			newSearchParams.set("parent", parent);
		} else {
			newSearchParams.delete("parent");
		}
		if (estimatePadding != 0) {
			newSearchParams.set("estimatePadding", estimatePadding + "");
		} else {
			newSearchParams.delete("estimatePadding");
		}
		if (group && group != allGroups) {
			newSearchParams.set("group", group);
		} else {
			newSearchParams.delete("group");
		}
		if (possibleUsersGroups && possibleUsersGroups.users && Object.keys(possibleUsersGroups.users).length) {
			if (users.size) {
				newSearchParams.set("users", [...users].join(","));
			} else {
				newSearchParams.delete("users");
			}
		}

		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [search, defaultEstimate, parent, estimatePadding, group, users]);

	let totalTimEstimate =
		tickets.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0) + estimatePadding;
	let totalTimeOriginalEstimate =
		tickets.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0) + estimatePadding;
	let totalTimeSpent = tickets.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			{!isDashboard && (
				<>
					<FormFields
						search={search}
						setSearch={setSearch}
						parent={parent}
						setParent={setParent}
						defaultEstimate={defaultEstimate}
						setDefaultEstimate={setDefaultEstimate}
						estimatePadding={estimatePadding}
						setEstimatePadding={setEstimatePadding}
					/>
					<UsersSelector
						possibleUsersGroups={possibleUsersGroups}
						group={group}
						setGroup={setGroup}
						users={users}
						setUsers={setUsers}
						setVisibleUsers={setVisibleUsers}
					/>
				</>
			)}
			{(search || parent) && (
				<TicketTable
					tickets={tickets}
					defaultEstimate={defaultEstimate}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
					isDashboard={isDashboard}
					possibleUsersGroups={possibleUsersGroups}
					ticketsBranches={ticketsBranches}
				/>
			)}
			{(search || parent) && !!tickets.length && (
				<Calendar
					users={users}
					group={group}
					possibleUsersGroups={possibleUsersGroups}
					totalTimEstimate={totalTimEstimate}
					visibleUsers={visibleUsers}
					isDashboard={isDashboard}
				/>
			)}
		</>
	);
}
export default EstimatorPage;
