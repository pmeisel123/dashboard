import type { SelectChangeEvent } from "@mui/material";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import type {
	GridColDef,
	GridFilterInputValueProps,
	GridFilterItem,
	GridFilterModel,
	GridFilterOperator,
	GridRenderCellParams,
} from "@mui/x-data-grid";
import { gridFilteredSortedRowEntriesSelector, useGridApiRef } from "@mui/x-data-grid";
import type { UserProps, UsersGroupProps } from "@src/Api";
import { getDayString } from "@src/Api";
import type { tableSetingsProps } from "@src/Components";
import { allGroups, CustomDataGrid, defaultTableSettings, getTicketColumns } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const UserHasGroup = (allJiraUsersGroups: UsersGroupProps, user_id: string, group: string) => {
	if (
		!allJiraUsersGroups ||
		!user_id ||
		!group ||
		!allJiraUsersGroups.users[user_id] ||
		!allJiraUsersGroups.users[user_id].groups ||
		!allJiraUsersGroups.users[user_id].groups.length
	) {
		return false;
	}
	if (group == allGroups) {
		return true;
	}
	return allJiraUsersGroups.users[user_id].groups.includes(group);
};

export const UsersSelector: FC<{
	allJiraUsersGroups: UsersGroupProps;
	group: string;
	setGroup: Dispatch<SetStateAction<string>>;
	users: Set<string>;
	setUsers: Dispatch<SetStateAction<Set<string>>>;
	setVisibleUsers: Dispatch<SetStateAction<Set<string>>>;
}> = ({ allJiraUsersGroups, group, setGroup, users, setUsers, setVisibleUsers }) => {
	const location = useLocation();
	const localStorageName = "TicketTableColumns." + location.pathname;
	const apiRef = useGridApiRef();
	const [columnModel, setColumnModel] = useState<tableSetingsProps>({
		...defaultTableSettings,
	});

	const customOperator: GridFilterOperator<UserProps, string> = {
		label: "has",
		value: "Contains",
		getApplyFilterFn: (filterItem: GridFilterItem) => {
			if (!filterItem.value || filterItem.value === allGroups) {
				return null;
			}
			return (_cellValue, row: UserProps) => {
				if (!group || group == allGroups) {
					return true;
				}
				return row.groups?.includes(group) ?? false;
			};
		},
		InputComponent: (props: GridFilterInputValueProps) => {
			const { item, applyValue } = props;
			const handleFilterChange = (event: SelectChangeEvent<string>) => {
				const val = event.target.value;
				applyValue({ ...item, value: val });
				setGroup(val === allGroups ? "" : val);
			};

			return (
				<FormControl size="small">
					<InputLabel id="UserGroup">Group</InputLabel>
					<Select
						label="Group"
						value={item.value || allGroups}
						onChange={handleFilterChange}
						sx={{ minWidth: 100 }}
					>
						<MenuItem key={allGroups} value={allGroups}>
							{allGroups}
						</MenuItem>
						{allJiraUsersGroups.groups.map((value: string) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			);
		},
	};
	const midnight = new Date();
	midnight.setHours(0, 0, 0, 0);
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
			valueGetter: (_params, row) => {
				return row.groups.join(",");
			},
		},
		{
			field: "vacations",
			headerName: "Vacations",
			flex: 3,
			renderCell: (params: GridRenderCellParams<UserProps>) => (
				<>
					{params.value &&
						params.value
							.filter((date: string) => new Date(date) >= midnight)
							.map((value: string, index: number) => (
								<Fragment key={index}>
									{!!index && <>, </>}
									{getDayString(new Date(value))}
								</Fragment>
							))}
				</>
			),
		},
	];

	const handleFilterChange = (newModel: GridFilterModel) => {
		if (newModel.items.length && !newModel.items.some((filter) => filter.field === "groups")) {
			setGroup(allGroups);
		} else {
			setGroup("");
		}
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
				{
					field: "groups",
					operator: "Contains",
					value: local_group,
				},
			];
		}
		setColumnModel(columnModel);
	}, []);
	const getNonFilteredRows = () => {
		if (Object.values(allJiraUsersGroups.users).length) {
			const allFilteredEntries = gridFilteredSortedRowEntriesSelector(apiRef);
			const allFilteredEntriesIds = new Set(allFilteredEntries.map((row) => row.id));
			setVisibleUsers(allFilteredEntriesIds as Set<string>);
		}
	};
	useEffect(() => {
		getNonFilteredRows();
	}, [allJiraUsersGroups.users, columnModel.GridFilterModel]);
	return (
		<>
			<CustomDataGrid
				localStorageName={localStorageName}
				getRowHeight={() => "auto"}
				rows={Object.values(allJiraUsersGroups.users)}
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
									value: {
										group,
									},
								},
							],
						},
					},
				}}
				onRowSelectionModelChange={(newRowSelectionModel) => {
					if (Object.values(allJiraUsersGroups.users).length) {
						setUsers(newRowSelectionModel.ids as Set<string>);
					}
				}}
				rowSelectionModel={{
					type: "include",
					ids: new Set(users),
				}}
				onFilterModelChange={handleFilterChange}
				apiRef={apiRef}
			/>
		</>
	);
};

export const UserSelector: FC<{
	allJiraUsersGroups: UsersGroupProps;
	group: string;
	setGroup: Dispatch<SetStateAction<string>>;
	user: string;
	setUser: Dispatch<SetStateAction<string>>;
}> = ({ allJiraUsersGroups, group, setGroup, user, setUser }) => {
	if (!Object.values(allJiraUsersGroups.users).length) {
		return (
			<Grid container spacing={2} sx={{ paddingBottom: 1 }}>
				<Grid>
					<InputLabel id="UserGroup">Group</InputLabel>
					<Select label="Group" value="x" sx={{ minWidth: 200 }} disabled>
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
								sx={{
									minWidth: 200,
								}}
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
						if (!UserHasGroup(allJiraUsersGroups, user, event.target.value)) {
							setUser("");
						}
					}}
					sx={{ minWidth: 200 }}
				>
					<MenuItem key={allGroups} value={allGroups}>
						All
					</MenuItem>
					{allJiraUsersGroups.groups.map((value: string) => (
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
							{Object.keys(allJiraUsersGroups.users)
								.filter((user_id) => UserHasGroup(allJiraUsersGroups, user_id, group))
								.map((user_id: string) => (
									<MenuItem key={user_id} value={user_id}>
										{allJiraUsersGroups.users[user_id].name}
									</MenuItem>
								))}
						</Select>
					</>
				)}
			</Grid>
		</Grid>
	);
};
