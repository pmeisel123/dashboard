import type {UsersGroupProps, UserProps} from '@src/Api';
import { Select, MenuItem, InputLabel, FormControl} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridFilterOperator} from '@mui/x-data-grid';

const UserSelectors: React.FC<{
	possibleUsersGroups: UsersGroupProps,
	group: string
	setGroup: React.Dispatch<React.SetStateAction<string>>,
	users: string[],
	setUsers: React.Dispatch<React.SetStateAction<string[]>>,
}> = ({possibleUsersGroups, group, setGroup, users, setUsers}) => {
	const customOperator: GridFilterOperator<any, number, string> = {
		label: 'HAS',
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
						<MenuItem key='---All---' value=''>All</MenuItem>
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
		{ field: 'vacations', headerName: 'Vacations', flex: 1, filterOperators: [customOperator]},
	];
	return (
		<>Hi
			<DataGrid
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
					setUsers(newRowSelectionModel.ids);
				}}
				rowSelectionModel={{type: 'include', ids: new Set(users)}}
			/>
		</>
	)
};
export default UserSelectors;