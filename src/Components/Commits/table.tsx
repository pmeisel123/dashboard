import { Link } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type {
	AppDispatch,
	BranchCommit,
	BranchesAndTicket,
	ReportNamePaths,
	RootState,
	TicketProps,
	UsersGroupPropsSlice,
} from "@src/Api";
import { fetchUsersAndGroups, GetBranchCreator, isSliceRecent } from "@src/Api";
import { Ago, CustomDataGrid } from "@src/Components";
import type { FC } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

declare const __GIT_REPOS_PATHS__: { [key: string]: ReportNamePaths };
declare const __API_URL__: string;

export const CommitsTable: FC<{
	repo: string;
	ticketsBranches: BranchesAndTicket;
	tickets: { [key: string]: TicketProps };
	loading: boolean;
	commits: BranchCommit[];
}> = ({ repo, ticketsBranches, tickets, loading, commits }) => {
	const allJiraUsersGroups: UsersGroupPropsSlice = useSelector((state: RootState) => state.usersAndGroupsState);
	const localStorageName = "CommitsTableColumns." + location.pathname;
	const dispatch = useDispatch<AppDispatch>();

	let columns: GridColDef<BranchCommit>[] = [
		{
			field: "message",
			headerName: "Commit Mesage",
			flex: 6,
			renderCell: (params: GridRenderCellParams<BranchCommit>) => {
				const url = __GIT_REPOS_PATHS__[repo].url + "/commit/" + params.row.sha;
				return (
					<Link href={url} target="_blank" rel="noopener noreferrer">
						{params.row.message}
					</Link>
				);
			},
		},
		{
			field: "date",
			headerName: "Commit Date",
			flex: 1,
			valueGetter: (_params, row) => {
				if (row.date) {
					return new Date(row.date);
				}
			},
			renderCell: (params: GridRenderCellParams<BranchCommit>) => {
				if (params.row.date) {
					return <div title={new Date(params.row.date).toDateString()}>{Ago(params.value)}</div>;
				}
			},
		},
		{
			field: "ticket_key",
			headerName: "Ticket Key",
			renderCell: (params: GridRenderCellParams<BranchCommit>) => (
				<Link
					href={(__API_URL__ + "/browse/" + params.row.ticket) as string}
					target="_blank"
					rel="noopener noreferrer"
				>
					{params.row.ticket}
				</Link>
			),
		},
		{
			field: "ticket_summary",
			headerName: "Ticket Summary",
			renderCell: (params: GridRenderCellParams<BranchCommit>) => {
				if (params.row.ticket && params.row.ticket in tickets) {
					return (
						<Link
							href={(__API_URL__ + "/browse/" + params.row.ticket) as string}
							target="_blank"
							rel="noopener noreferrer"
						>
							{tickets[params.row.ticket].summary}
						</Link>
					);
				}
			},
			flex: 4,
		},
		{
			field: "ticket_labels",
			headerName: "Ticket Labels",
			valueGetter: (_params, row) => {
				if (row.ticket) {
					return tickets[row.ticket]?.labels?.join(", ");
				}
			},
			flex: 1,
		},
		{
			field: "creator",
			headerName: "Creator",
			valueGetter: (_params, row) => {
				if (row.creator) {
					const user = GetBranchCreator(row.creator, allJiraUsersGroups);
					let user_name = row.creator;
					if (user && user.name) {
						user_name = user.name;
					}
					return user_name;
				}
				return row.creator;
			},
			flex: 2,
		},
	];

	useEffect(() => {
		if (!isSliceRecent(allJiraUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);

	if (!Object.keys(ticketsBranches.branches).length) {
		return;
	}
	return (
		<CustomDataGrid
			columns={columns}
			getRowId={(row) => row.sha}
			rows={commits}
			loading={loading}
			checkboxSelection={false}
			disableRowSelectionOnClick
			localStorageName={localStorageName}
		/>
	);
};
