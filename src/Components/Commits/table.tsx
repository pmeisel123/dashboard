import { Box, Link } from "@mui/material";
import type {
	GridColDef,
	GridColumnVisibilityModel,
	GridFilterModel,
	GridRenderCellParams,
	GridSortModel,
} from "@mui/x-data-grid";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import type {
	AppDispatch,
	BranchCommit,
	BranchesAndTicket,
	ReportNamePaths,
	RootState,
	TicketProps,
	UsersGroupPropsSlice,
} from "@src/Api";
import { fetchUsersAndGroups, GetBranchCreator, isUserDataRecent } from "@src/Api";
import type { tableSetingsProps, updateGridModelProps } from "@src/Components";
import { Ago, defaultTableSettings, getTicketColumns } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
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
	const [columnModel, setColumnModel] = useState<tableSetingsProps>({
		...defaultTableSettings,
	});
	const dispatch = useDispatch<AppDispatch>();
	const apiRef = useGridApiRef();

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
			renderCell: (params: GridRenderCellParams<BranchCommit>) => {
				if (params.row.ticket) {
					return <>{tickets[params.row.ticket]?.labels?.join(", ")}</>;
				}
			},
			flex: 1,
		},
		{
			field: "creator",
			headerName: "Creator",
			renderCell: (params: GridRenderCellParams<BranchCommit>) => {
				if (params.row.creator) {
					const user = GetBranchCreator(params.row.creator, allJiraUsersGroups);
					let user_name = params.row.creator;
					if (user && user.name) {
						user_name = user.name;
					}
					return <>{user_name}</>;
				}
			},
			flex: 2,
		},
	];

	useEffect(() => {
		if (!isUserDataRecent(allJiraUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);

	const handleColumnModelChange = ({ column, newModel }: updateGridModelProps) => {
		const newColumnModel = {
			...columnModel,
			[column]: newModel,
		};
		localStorage.setItem(localStorageName, JSON.stringify(newColumnModel));
		setColumnModel(newColumnModel);
	};

	const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
		handleColumnModelChange({
			column: "GridColumnVisibilityModel",
			newModel: newModel,
		});
	};

	const handleSortModelChange = (newModel: GridSortModel) => {
		handleColumnModelChange({
			column: "GridSortModel",
			newModel: newModel,
		});
	};

	const handleFilterChange = (newModel: GridFilterModel) => {
		handleColumnModelChange({
			column: "GridFilterModel",
			newModel: newModel,
		});
	};

	useEffect(() => {
		let newColumnModel = getTicketColumns(localStorageName, columns);
		setColumnModel(newColumnModel);
	}, []);
	if (!Object.keys(ticketsBranches.branches).length) {
		return;
	}
	return (
		<Box sx={{ width: "100%" }}>
			<DataGrid
				getRowHeight={() => "auto"}
				columns={columns}
				getRowId={(row) => row.sha}
				rows={commits}
				loading={loading}
				slotProps={{
					loadingOverlay: {
						variant: "linear-progress",
						noRowsVariant: "skeleton",
					},
				}}
				checkboxSelection={false}
				disableRowSelectionOnClick
				autosizeOnMount
				autosizeOptions={{
					includeHeaders: false,
					includeOutliers: true,
				}}
				columnVisibilityModel={columnModel.GridColumnVisibilityModel}
				sortModel={columnModel.GridSortModel}
				filterModel={columnModel.GridFilterModel}
				onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
				onSortModelChange={handleSortModelChange}
				onFilterModelChange={handleFilterChange}
				apiRef={apiRef}
			/>
		</Box>
	);
};
