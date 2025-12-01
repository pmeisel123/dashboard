import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import type {
	GridColDef,
	GridColumnVisibilityModel,
	GridFilterModel,
	GridFilterOperator,
	GridRenderCellParams,
	GridSortModel,
} from "@mui/x-data-grid";
import {
	DataGrid,
	gridFilteredSortedRowEntriesSelector,
	useGridApiRef,
} from "@mui/x-data-grid";
import type { UserProps, UsersGroupProps } from "@src/Api";
import { getDayString } from "@src/Api";
import type { tableSetingsProps, updateGridModelProps } from "@src/Components";
import {
	allGroups,
	defaultTableSettings,
	getTicketColumns,
} from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const UserHasGroup = (
	possibleUsersGroups: UsersGroupProps,
	user_id: string,
	group: string,
) => {
	if (
		!possibleUsersGroups ||
		!user_id ||
		!group ||
		!possibleUsersGroups.users[user_id] ||
		!possibleUsersGroups.users[user_id].groups ||
		!possibleUsersGroups.users[user_id].groups.length
	) {
		return false;
	}
	if (group == allGroups) {
		return true;
	}
	return possibleUsersGroups.users[user_id].groups.includes(group);
};

export const UsersSelector: FC<{
	possibleUsersGroups: UsersGroupProps;
	group: string;
	setGroup: Dispatch<SetStateAction<string>>;
	users: Set<string>;
	setUsers: Dispatch<SetStateAction<Set<string>>>;
	setVisibleUsers: Dispatch<SetStateAction<Set<string>>>;
}> = ({
	possibleUsersGroups,
	group,
	setGroup,
	users,
	setUsers,
	setVisibleUsers,
}) => {
	const location = useLocation();
	const localStorageName = "TicketTableColumns." + location.pathname;
	const apiRef = useGridApiRef();
	const [columnModel, setColumnModel] = useState<tableSetingsProps>({
		...defaultTableSettings,
	});

	const customOperator: GridFilterOperator<UsersGroupProps, string[]> = {
		label: "has",
		value: "Contains",
		getApplyFilterFn: () => {
			if (!group) {
				setGroup(allGroups);
			}
			return (cellValue) => {
				if (!cellValue) {
					return false;
				}
				if (!group || group == allGroups) {
					return true;
				}
				return cellValue.includes(group);
			};
		},
		InputComponent: () => {
			return (
				<FormControl size="small">
					<InputLabel id="UserGroup">Group</InputLabel>
					<Select
						label="Group"
						value={group}
						onChange={(event) => {
							if (event.target.value) {
								handleColumnModelChange({
									column: "GridFilterModel",
									newModel: {
										items: [
											{
												field: "groups",
												operator: "Contains",
												value: event.target.value,
											},
										],
									},
								});
								setGroup(event.target.value);
							}
						}}
						sx={{ minWidth: 100 }}
					>
						<MenuItem key={allGroups} value={allGroups}>
							{allGroups}
						</MenuItem>
						{possibleUsersGroups.groups.map((value: string) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			);
		},
	};

	const columns: GridColDef<any>[] = [
		{
			field: "icon",
			headerName: "Icon",
			renderCell: (params: GridRenderCellParams<UserProps>) => (
				<img src={params.value} style={{ maxWidth: "30px" }} />
			),
			width: 30,
		},
		{ field: "name", headerName: "Name", flex: 1 },
		{ field: "email", headerName: "Email", flex: 1 },
		{
			field: "groups",
			headerName: "Groups",
			flex: 1,
			filterOperators: [customOperator],
		},
		{
			field: "vacations",
			headerName: "Vacations",
			flex: 3,
			renderCell: (params: GridRenderCellParams<UserProps>) => (
				<>
					{params.value &&
						params.value.map((value: string, index: number) => (
							<Fragment key={index}>
								{!!index && <>, </>}
								{getDayString(new Date(value))}
							</Fragment>
						))}
				</>
			),
		},
	];

	const handleColumnModelChange = ({
		column,
		newModel,
	}: updateGridModelProps) => {
		const newColumnModel = {
			...columnModel,
			[column]: newModel,
		};
		localStorage.setItem(localStorageName, JSON.stringify(newColumnModel));
		setColumnModel(newColumnModel);
	};

	const handleColumnVisibilityModelChange = (
		newModel: GridColumnVisibilityModel,
	) => {
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
		if (
			newModel.items.length &&
			!newModel.items.some((filter) => filter.field === "groups")
		) {
			setGroup(allGroups);
		}
		handleColumnModelChange({
			column: "GridFilterModel",
			newModel: newModel,
		});
	};

	useEffect(() => {
		let columnModel = getTicketColumns(localStorageName, columns);
		let local_group = group;
		if (group != allGroups) {
			local_group == allGroups;
			setGroup(local_group);
		}
		if (local_group != allGroups) {
			columnModel.GridFilterModel.items = [
				{ field: "groups", operator: "Contains", value: local_group },
			];
		}
		setColumnModel(columnModel);
	}, []);
	const getNonFilteredRows = () => {
		if (Object.values(possibleUsersGroups.users).length) {
			const allFilteredEntries =
				gridFilteredSortedRowEntriesSelector(apiRef);
			const allFilteredEntriesIds = new Set(
				allFilteredEntries.map((row) => row.id),
			);
			setVisibleUsers(allFilteredEntriesIds as Set<string>);
		}
	};
	useEffect(() => {
		getNonFilteredRows();
	}, [possibleUsersGroups.users, columnModel.GridFilterModel]);
	return (
		<>
			<DataGrid
				sx={{
					"& .MuiDataGrid-cell": {
						display: "flex",
						alignItems: "center",
					},
				}}
				getRowHeight={() => "auto"}
				rows={Object.values(possibleUsersGroups.users)}
				columns={columns}
				checkboxSelection={true}
				disableRowSelectionExcludeModel
				initialState={{
					filter: {
						filterModel: {
							items: [
								{
									field: "groups",
									operator: "Contains",
									value: { group },
								},
							],
						},
					},
				}}
				onRowSelectionModelChange={(newRowSelectionModel) => {
					if (Object.values(possibleUsersGroups.users).length) {
						setUsers(newRowSelectionModel.ids as Set<string>);
					}
				}}
				rowSelectionModel={{ type: "include", ids: new Set(users) }}
				columnVisibilityModel={columnModel.GridColumnVisibilityModel}
				sortModel={columnModel.GridSortModel}
				filterModel={columnModel.GridFilterModel}
				onColumnVisibilityModelChange={
					handleColumnVisibilityModelChange
				}
				onSortModelChange={handleSortModelChange}
				onFilterModelChange={handleFilterChange}
				apiRef={apiRef}
			/>
		</>
	);
};

export const UserSelector: FC<{
	possibleUsersGroups: UsersGroupProps;
	group: string;
	setGroup: Dispatch<SetStateAction<string>>;
	user: string;
	setUser: Dispatch<SetStateAction<string>>;
}> = ({ possibleUsersGroups, group, setGroup, user, setUser }) => {
	if (!Object.values(possibleUsersGroups.users).length) {
		return (
			<Grid container spacing={2} sx={{ paddingBottom: 1 }}>
				<Grid>
					<InputLabel id="UserGroup">Group</InputLabel>
					<Select
						label="Group"
						value="x"
						sx={{ minWidth: 200 }}
						disabled
					>
						<MenuItem key="x" value="x">
							Loading...
						</MenuItem>
					</Select>
				</Grid>
				<Grid>
					{group && (
						<>
							<InputLabel id="user">User</InputLabel>
							<Select
								label="user"
								value="x"
								sx={{ minWidth: 200 }}
								disabled
							>
								<MenuItem key="" value="x">
									Loading...
								</MenuItem>
							</Select>
						</>
					)}
				</Grid>
			</Grid>
		);
	}
	return (
		<Grid container spacing={2} sx={{ paddingBottom: 1 }}>
			<Grid>
				<InputLabel id="UserGroup">Group</InputLabel>
				<Select
					label="Group"
					value={group}
					onChange={(event) => {
						setGroup(event.target.value);
						if (
							!UserHasGroup(
								possibleUsersGroups,
								user,
								event.target.value,
							)
						) {
							setUser("");
						}
					}}
					sx={{ minWidth: 200 }}
				>
					<MenuItem key={allGroups} value={allGroups}>
						All
					</MenuItem>
					{possibleUsersGroups.groups.map((value: string) => (
						<MenuItem key={value} value={value}>
							{value}
						</MenuItem>
					))}
				</Select>
			</Grid>
			<Grid>
				{group && (
					<>
						<InputLabel id="user">User</InputLabel>
						<Select
							label="user"
							value={user}
							onChange={(event) => {
								setUser(event.target.value);
							}}
							sx={{ minWidth: 200 }}
						>
							{Object.keys(possibleUsersGroups.users)
								.filter((user_id) =>
									UserHasGroup(
										possibleUsersGroups,
										user_id,
										group,
									),
								)
								.map((user_id: string) => (
									<MenuItem key={user_id} value={user_id}>
										{
											possibleUsersGroups.users[user_id]
												.name
										}
									</MenuItem>
								))}
						</Select>
					</>
				)}
			</Grid>
		</Grid>
	);
};
