import type {UsersGroupProps, UserProps} from '@src/Api';
import { Select, MenuItem, InputLabel, FormControl, Grid} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridFilterOperator} from '@mui/x-data-grid';
import {getDayString} from '@src/Api';
import React from 'react';

export const allGroups = 'All';

export const UserHasGroup = (possibleUsersGroups: UsersGroupProps, user_id: string, group: string) => {
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
	if(group == allGroups) {
		return true;
	}
	return possibleUsersGroups.users[user_id].groups.includes(group);
} 

export const UsersSelector: React.FC<{
	possibleUsersGroups: UsersGroupProps,
	group: string
	setGroup: React.Dispatch<React.SetStateAction<string>>,
	users: Set<string>,
	setUsers: React.Dispatch<React.SetStateAction<Set<string>>>,
}> = ({possibleUsersGroups, group, setGroup, users, setUsers}) => {
	const customOperator: GridFilterOperator<any, number, string> = {
		label: 'has',
		value: 'Contains', // A unique value for the operator
		getApplyFilterFn: () => {
			return (value: string[]): boolean => {
				if (!group) {
					return true;
				}
				return value.includes( group );
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
							setGroup(event.target.value);
						}}
						sx={{minWidth: 100}}
					>
						<MenuItem key={allGroups} value={allGroups}>{allGroups}</MenuItem>
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
			field: 'icon',
			headerName: '',
			renderCell: (params: GridRenderCellParams<UserProps>) => (
				<img src={params.value} style={{maxWidth: '30px'}} />
			),
			width: 30,
		},
		{ field: 'name', headerName: 'Name', flex: 1 },
		{ field: 'email', headerName: 'Email', flex: 1 },
		{ field: 'groups', headerName: 'Groups', flex: 1, filterOperators: [customOperator]},
		{
			field: 'vacations',
			headerName: 'Vacations',
			flex: 3,
			renderCell: (params: GridRenderCellParams<UserProps>) => (
				<>
					{params.value && params.value.map((value:string, index: number) => (
						<React.Fragment key={index}>
							{(!!index) && <>, </>}
							{getDayString(new Date(value))}
						</React.Fragment>
					))}
				</>
			),
		},
	];
	return (
		<>
			<DataGrid
				sx={{
					'& .MuiDataGrid-cell': {
						display: 'flex',
						alignItems: 'center',
					},
				}}
				getRowHeight={() => 'auto'}
				rows={Object.values(possibleUsersGroups.users)}
				columns={columns}
				checkboxSelection={true}
				initialState={{
					filter: {
						filterModel: {
							items: [{ field: 'groups', operator: 'Contains', value: {group} }],
						},
					}
				}}
				onRowSelectionModelChange={(newRowSelectionModel) => {
					if (Object.values(possibleUsersGroups.users).length) {
						setUsers(newRowSelectionModel.ids as Set<string>);
					}
				}}
				rowSelectionModel={{type: 'include', ids: new Set(users)}}
			/>
		</>
	)
};

export const UserSelector: React.FC<{
	possibleUsersGroups: UsersGroupProps,
	group: string
	setGroup: React.Dispatch<React.SetStateAction<string>>,
	user: string,
	setUser: React.Dispatch<React.SetStateAction<string>>,
}> = ({possibleUsersGroups, group, setGroup, user, setUser}) => {
	if (!Object.values(possibleUsersGroups.users).length) {
		return;
	}
	return (
		<Grid container spacing={2}>
			<Grid>
				<InputLabel id="UserGroup">Group</InputLabel> 
				<Select
					label="Group"
					value={group}
					onChange={(event) => {
						setGroup(event.target.value);
						if (!UserHasGroup(possibleUsersGroups, user, event.target.value)) {
							setUser('');
						}
					}}
					sx={{minWidth: 100}}
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
			{
				(group) &&
				<>
					<InputLabel id="user">User</InputLabel>
					<Select
						label="user"
						value={user}
						onChange={(event) => {
							setUser(event.target.value);
						}}
						sx={{minWidth: 100}}
					>
						{Object.keys(possibleUsersGroups.users).filter(user_id => UserHasGroup(possibleUsersGroups, user_id, group)).map((user_id: string) => (
							<MenuItem key={user_id} value={user_id}>
								{possibleUsersGroups.users[user_id].name}
							</MenuItem>
						))}
					</Select>
				</>
			}
			</Grid>
		</Grid>
	);
};
