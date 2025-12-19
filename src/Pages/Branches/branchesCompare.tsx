import { Box, Button, Grid, InputLabel, Link, MenuItem, Select } from "@mui/material";
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
import {
	fetchBranches,
	fetchTickets,
	fetchUsersAndGroups,
	GetBranchCreator,
	getBranchesCompare,
	isGitDataRecent,
	isUserDataRecent,
} from "@src/Api";
import type { tableSetingsProps, updateGridModelProps } from "@src/Components";
import { Ago, defaultTableSettings, getTicketColumns } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

declare const __API_URL__: string;
declare const __GIT_REPOS_PATHS__: { [key: string]: ReportNamePaths };

const BranchesComparePage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const ticketsBranches: BranchesAndTicket = useSelector((state: RootState) => state.gitBranchState);
	const allJiraUsersGroups: UsersGroupPropsSlice = useSelector((state: RootState) => state.usersAndGroupsState);
	const [repo, setRepo] = useState<string>(searchParams.get("repo") || "");
	const [branch1, setBranch1] = useState<string>(searchParams.get("branch1") || "");
	const [branch2, setBranch2] = useState<string>(searchParams.get("branch2") || "");
	const [commits, setCommits] = useState<BranchCommit[]>([]);
	const [tickets, setTickets] = useState<{ [key: string]: TicketProps }>({});
	const dispatch = useDispatch<AppDispatch>();
	const localStorageName = "CommitsTableColumns." + location.pathname;
	const apiRef = useGridApiRef();
	const [columnModel, setColumnModel] = useState<tableSetingsProps>({
		...defaultTableSettings,
	});

	const loadParams = () => {
		setRepo(searchParams.get("repo") || "");
		setBranch1(searchParams.get("branch1") || "");
		setBranch2(searchParams.get("branch2") || "");
	};
	useEffect(() => {
		loadParams();
	}, [searchParams]);

	useEffect(() => {
		if (!searchParamsOveride) {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			if (repo != "") {
				newSearchParams.set("repo", repo);
				if (branch1 != "") {
					newSearchParams.set("branch1", branch1);
				} else {
					newSearchParams.delete("branch1");
				}
				if (branch2 != "") {
					newSearchParams.set("branch2", branch2);
				} else {
					newSearchParams.delete("branch2");
				}
			} else {
				newSearchParams.delete("repo");
				newSearchParams.delete("branch1");
				newSearchParams.delete("branch2");
				setBranch1("");
				setBranch2("");
			}
			if (searchParams.toString() != newSearchParams.toString()) {
				setSearchParams(newSearchParams);
			}
		}
		if (repo && branch1 && branch2) {
			getBranchesCompare(repo, branch1, branch2).then((data: BranchCommit[]) => {
				setCommits(data);
			});
		} else {
			setCommits([]);
		}
	}, [repo, branch1, branch2]);

	useEffect(() => {
		let ticket_search = "";
		commits.forEach((commit) => {
			if (commit.ticket) {
				if (ticket_search) {
					ticket_search += " OR ";
				}
				ticket_search += 'key = "' + commit.ticket + '"';
			}
		});
		if (ticket_search) {
			dispatch(fetchTickets(ticket_search)).then((data: any) => {
				let local_tickets = { ...tickets };
				if (data && data.payload && data.payload.length) {
					data.payload.forEach((ticket: TicketProps) => {
						local_tickets[ticket.key] = ticket;
					});
				}
				setTickets(local_tickets);
			});
		}
	}, [commits]);

	useEffect(() => {
		if (!isGitDataRecent(ticketsBranches)) {
			dispatch(fetchBranches());
		}
		if (!isUserDataRecent(allJiraUsersGroups)) {
			dispatch(fetchUsersAndGroups());
		}
	}, [dispatch]);
	useEffect(() => {
		if (ticketsBranches.branches && Object.keys(ticketsBranches.branches).length == 1) {
			setRepo(Object.keys(ticketsBranches.branches)[0]);
		}
	});
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
		if (!newColumnModel.GridSortModel.length) {
			newColumnModel.GridSortModel = [{ field: "date", sort: "asc" }];
		}
		setColumnModel(newColumnModel);
	}, []);
	if (!Object.keys(ticketsBranches.branches).length) {
		return;
	}
	return (
		<>
			<Grid container spacing={2} sx={{ paddingBottom: 1 }}>
				<Grid>
					<br />
					<InputLabel id="user">Repo</InputLabel>
					<Select
						label="repo"
						value={repo}
						onChange={(event) => {
							setRepo(event.target.value);
						}}
					>
						{Object.keys(ticketsBranches.branches).map((value: string) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</Select>
				</Grid>
				<Grid>
					Find all commits in
					<InputLabel id="branch1">Branch 1</InputLabel>
					<Select
						label="branch1"
						value={branch1}
						onChange={(event) => {
							setBranch1(event.target.value);
						}}
					>
						{repo &&
							ticketsBranches.branches[repo].map((value) => (
								<MenuItem key={repo + "__" + value.name} value={value.name}>
									{value.name}
								</MenuItem>
							))}
					</Select>
				</Grid>
				<Grid>
					that are not in
					<InputLabel id="branch1">Branch 2</InputLabel>
					<Select
						label="branch2"
						value={branch2}
						onChange={(event) => {
							setBranch2(event.target.value);
						}}
					>
						{repo &&
							ticketsBranches.branches[repo].map((value) => (
								<MenuItem key={repo + "__" + value.name} value={value.name}>
									{value.name}
								</MenuItem>
							))}
					</Select>
				</Grid>
				<Grid>
					&nbsp;
					<InputLabel id="none">&nbsp;</InputLabel>
					<Button
						onClick={() => {
							const orig = branch1; // Technically not needed, but makes me feel better
							setBranch1(branch2);
							setBranch2(orig);
						}}
					>
						Swap
					</Button>
				</Grid>
			</Grid>
			{repo && commits && (
				<Box sx={{ width: "100%" }}>
					<DataGrid
						getRowHeight={() => "auto"}
						columns={columns}
						getRowId={(row) => row.sha}
						rows={commits}
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
			)}
		</>
	);
};
export default BranchesComparePage;
