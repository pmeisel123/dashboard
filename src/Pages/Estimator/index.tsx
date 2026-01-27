import type { AppDispatch, RootState, TicketProps } from "@src/Api";
import { fetchBranches, fetchConfig, fetchTickets, fetchUsersAndGroups, isSliceRecent } from "@src/Api";
import { allGroups, Calendar, FormFields, TicketTable, UsersSelector } from "@src/Components";
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";

const defaultDefaultDefaultEstimate = 2;

const EstimatorPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride || undefined);

	const initialDefaultEstimate = useMemo(
		() => parseInt(searchParams.get("defaultEstimate") || `${defaultDefaultDefaultEstimate}`, 10),
		[searchParams],
	);

	const ticketsSelector = useSelector((state: RootState) => state.ticketsState);
	const [search, setSearch] = useState<string>(searchParams.get("search") || "");
	const [jiraSearch, setJiraSearch] = useState<string>("");
	const tickets: TicketProps[] = useSelector((state: RootState) => state.ticketsState[jiraSearch] ?? []);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(initialDefaultEstimate);
	const [parent, setParent] = useState<string>(searchParams.get("parent") || "");
	const [estimatePadding, setEstimatePadding] = useState<number>(
		parseFloat(searchParams.get("estimatePadding") || "0"),
	);
	const allJiraUsersGroups = useSelector((state: RootState) => state.usersAndGroupsState);
	const [group, setGroup] = useState<string>(searchParams.get("group") || allGroups);

	const initialUsers = useMemo(() => {
		const up = searchParams.get("users") || "";
		return new Set((up ? up.split(",") : []).filter(Boolean));
	}, [searchParams]);

	const [users, setUsers] = useState<Set<string>>(initialUsers);
	const [visibleUsers, setVisibleUsers] = useState<Set<string>>(new Set());
	const freezeParams = useRef(false);
	const ticketsBranches = useSelector((state: RootState) => state.gitBranchState);
	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	const [lastDay, setLastDay] = useState<string>("");

	const loadParams = () => {
		setDefaultEstimate(parseInt(searchParams.get("defaultEstimate") || `${defaultDefaultDefaultEstimate}`, 10));
		setSearch(searchParams.get("search") || "");
		setParent(searchParams.get("parent") || "");
		setEstimatePadding(parseFloat(searchParams.get("estimatePadding") || "0"));
		setGroup(searchParams.get("group") || allGroups);
		setUsers(new Set((searchParams.get("users") || "").split(",").filter(Boolean)));
	};

	useEffect(() => {
		freezeParams.current = true;
		loadParams();
		const id = setTimeout(() => {
			freezeParams.current = false;
		});
		return () => clearTimeout(id);
	}, [searchParams]);

	const buildJiraQuery = (search: string, parent: string) => {
		const ss = (search || "").trim();
		const pp = (parent || "").trim();
		if (ss && pp) return `${ss} AND parent=${pp}`;
		if (!ss && pp) return `parent = ${pp}`;
		return ss;
	};

	const getFunc = function () {
		const jira_search = buildJiraQuery(search, parent);
		if (!jira_search) {
			setJiraSearch("");
			return;
		}
		setJiraSearch(jira_search);
		// use ticketsSelector to decide if we need to set loading
		setLoading(!ticketsSelector[jira_search] || !ticketsSelector[jira_search].length);
		dispatch(fetchTickets([jira_search, config])).finally(() => {
			setLoading(false);
		});
	};

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
		// run a search on mount
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
		if (allJiraUsersGroups && allJiraUsersGroups.users && Object.keys(allJiraUsersGroups.users).length) {
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

	const totalTimEstimate = useMemo(
		() => tickets.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0) + estimatePadding,
		[tickets, defaultEstimate, estimatePadding],
	);
	const totalTimeOriginalEstimate = useMemo(
		() => tickets.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0) + estimatePadding,
		[tickets, defaultEstimate, estimatePadding],
	);
	const totalTimeSpent = useMemo(() => tickets.reduce((sum, row) => sum + (row.timespent || 0), 0), [tickets]);

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
						allJiraUsersGroups={allJiraUsersGroups}
						group={group}
						setGroup={setGroup}
						users={users}
						setUsers={setUsers}
						setVisibleUsers={setVisibleUsers}
					/>
				</>
			)}
			{(search || parent) && !!tickets.length && !!lastDay && (
				<strong>Work will be completed on {lastDay}</strong>
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
					allJiraUsersGroups={allJiraUsersGroups}
					ticketsBranches={ticketsBranches}
				/>
			)}
			{(search || parent) && !!tickets.length && (
				<>
					{!!lastDay && <strong>Work will be completed on {lastDay}</strong>}
					<Calendar
						users={users}
						group={group}
						allJiraUsersGroups={allJiraUsersGroups}
						totalTimEstimate={totalTimEstimate}
						visibleUsers={visibleUsers}
						isDashboard={isDashboard}
						setLastDay={setLastDay}
					/>
				</>
			)}
		</>
	);
};
export default EstimatorPage;

export const GetModulePages = () => [
	{
		path: "/Estimator",
		name: "Estimator",
		element: <EstimatorPage />,
		description: (
			<>
				Calculate approximate project completion dates based on Jira ticket estimates, user selection, upcoming
				vacations, and holidays. Useful for project planning.
			</>
		),
		requires: "APIURL",
	},
];
