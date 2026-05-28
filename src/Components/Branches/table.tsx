import { Link } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { AppDispatch, BranchesAndTicket, GitBranch, RootState, TicketProps, UsersGroupProps } from "@src/Api";
import { fetchConfig, GetBranchCreator, isSliceRecent } from "@src/Api";
import type { tableSetingsProps } from "@src/Components";
import { Ago, allGroups, CustomDataGrid, defaultTableSettings } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import type { rowProp } from "./const";

const BranchesTable: FC<{
	ticketsBranches: BranchesAndTicket;
	allJiraUsersGroups: UsersGroupProps;
	tickets: { [key: string]: TicketProps };
	isDashboard?: boolean;
	defaultSort?: string;
	defaultSortDirection?: "asc" | "desc";
	loaded: boolean;
	user: string;
	group: string;
}> = ({
	ticketsBranches,
	allJiraUsersGroups,
	tickets,
	isDashboard,
	defaultSort,
	defaultSortDirection,
	loaded,
	user,
	group,
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	const location = useLocation();
	const localStorageName = "GitTableColumns22." + location.pathname;
	const [rows, setRows] = useState<rowProp[]>([]);
	const [rowsFilter, setRowsFiltered] = useState<rowProp[]>([]);

	let columns: GridColDef<any>[] = [
		{ field: "repo", headerName: "Repo Name" },
		{
			field: "branch_name",
			headerName: "Branch",
			renderCell: (params: GridRenderCellParams<rowProp>) => {
				const repo = params.row.repo;
				const url = config.GIT_REPOS_PATHS[repo].url + "/tree/" + params.value;
				return (
					<Link href={url} target={"_blank"}>
						{params.value}
					</Link>
				);
			},
			flex: 1,
		},
		{
			field: "branch_creator",
			headerName: "Branch Creator",
			flex: 1,
		},
		{
			field: "last_commit",
			headerName: "Last Commit",
			renderCell: (params: GridRenderCellParams<rowProp>) => <>{Ago(params.value)}</>,
			flex: 1,
		},
		{
			field: "last_commit_message",
			headerName: "Last Commit Message",
			flex: 1,
		},
	];
	if (config.API_URL) {
		columns = [
			...columns,
			{
				field: "ticket_key",
				headerName: "Ticket Key",
				renderCell: (params: GridRenderCellParams<rowProp>) => (
					<Link
						href={(config.API_URL + "/browse/" + params.value) as string}
						target="_blank"
						rel="noopener noreferrer"
					>
						{params.value}
					</Link>
				),
				flex: 1,
			},
			{
				field: "ticket_summary",
				headerName: "Ticket Summary",
				renderCell: (params: GridRenderCellParams<rowProp>) => (
					<Link
						href={(config.API_URL + "/browse/" + params.row.ticket_key) as string}
						target="_blank"
						rel="noopener noreferrer"
					>
						{params.value}
					</Link>
				),
				flex: 1,
			},
			{
				field: "ticket_assignee",
				headerName: "Ticket Assignee",
				flex: 1,
			},
			{
				field: "ticket_status",
				headerName: "Ticket Status",
				flex: 1,
			},
		];
	}
	const defaultColumnModel: tableSetingsProps = {
		...defaultTableSettings,
	};
	if (defaultSort && isDashboard) {
		if (defaultSortDirection == "desc") {
			defaultColumnModel.GridSortModel = [{ field: defaultSort, sort: "desc" }];
		} else {
			defaultColumnModel.GridSortModel = [{ field: defaultSort, sort: "asc" }];
		}
	}
	if (
		Object.keys(config.GIT_REPOS_PATHS).length == 1 && // Only 1 repo, don't need to show the repo column
		(!defaultColumnModel.GridColumnVisibilityModel ||
			!Object.keys(defaultColumnModel.GridColumnVisibilityModel).length)
	) {
		defaultColumnModel.GridColumnVisibilityModel["repo"] = false;
	}

	const getRow = (repo: string, branch: GitBranch) => {
		const branch_name = branch.name;
		let branch_creator = branch.creator || null;
		let branch_creator_id: string | null = null;
		if (branch_creator) {
			const branch_creator_user = GetBranchCreator(branch_creator, allJiraUsersGroups);
			if (branch_creator_user) {
				branch_creator = branch_creator_user.name;
				branch_creator_id = branch_creator_user.id;
			}
		}
		const last_commit = branch.lastCommitDate ? new Date(branch.lastCommitDate) : null;
		const last_commit_message = branch.lastCommitMessage || "";
		const ticket_key = branch.ticket || null;
		let ticket_summary: string | null = null;
		let ticket_assignee: string | null = null;
		let ticket_status: string | null = null;
		let ticket_assignee_id: string | null = null;
		if (ticket_key && ticket_key in tickets) {
			const ticket = tickets[ticket_key];
			ticket_status = ticket.status;
			ticket_summary = ticket.summary;
			ticket_assignee = ticket.assignee;
			ticket_assignee_id = ticket.assignee_id;
		}
		return {
			id: repo + "___" + branch_name,
			repo: repo,
			branch_name: branch_name,
			branch_creator: branch_creator,
			branch_creator_id: branch_creator_id,
			last_commit: last_commit,
			last_commit_message: last_commit_message,
			ticket_key: ticket_key,
			ticket_summary: ticket_summary,
			ticket_assignee: ticket_assignee,
			ticket_assignee_id: ticket_assignee_id,
			ticket_status: ticket_status,
		};
	};

	const filterRow = (row: rowProp) => {
		if (user) {
			return row.branch_creator_id == user || row.ticket_assignee_id == user;
		}
		if (group && group != allGroups) {
			const creator_id = row.branch_creator_id;
			if (
				creator_id &&
				creator_id in allJiraUsersGroups.users &&
				allJiraUsersGroups.users[creator_id].groups &&
				allJiraUsersGroups.users[creator_id].groups.includes(group)
			) {
				return true;
			}
			const assignee_id = row.ticket_assignee_id;
			if (
				assignee_id &&
				assignee_id in allJiraUsersGroups.users &&
				allJiraUsersGroups.users[assignee_id].groups &&
				allJiraUsersGroups.users[assignee_id].groups.includes(group)
			) {
				return true;
			}
			return false;
		}
		return true;
	};

	const filterRows = (rows: rowProp[]) => {
		let local_rows = [...rows];
		if (user || group) {
			local_rows = rows.filter((row) => filterRow(row));
		}
		setRowsFiltered(local_rows);
	};

	useEffect(() => {
		const rows: rowProp[] = [];
		Object.keys(ticketsBranches.branches).forEach((repo) => {
			ticketsBranches.branches[repo].forEach((branch) => {
				rows.push(getRow(repo, branch));
			});
		});
		setRows(rows);
		filterRows(rows);
	}, [ticketsBranches, allJiraUsersGroups, tickets, loaded]);

	useEffect(() => {
		filterRows(rows);
	}, [user, group]);

	return (
		<CustomDataGrid
			rows={rowsFilter}
			columns={columns}
			loading={!loaded}
			defaultColumnModel={defaultColumnModel}
			checkboxSelection={false}
			disableRowSelectionOnClick
			localStorageName={localStorageName}
		/>
	);
};
export default BranchesTable;
