import {Box, Typography, useTheme} from '@mui/material';
import { DataGrid, GridPagination } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { Link } from '@mui/material';
import type {TicketProps} from '@src/Api'
import { formatDistanceToNow } from 'date-fns';

declare const __API_URL__: string;
const API_URL = __API_URL__;


interface CustomFooterProps {
	totalTimEstimate: number | null;
	totalTimeOriginalEstimate: number | null;
	totalTimeSpent: number | null;
}


const RenderEstimate: React.FC<{value: number | null, defaultEstimate: number | null}> = ({value, defaultEstimate}) => {
	if (value != null) {
		return <>{value}</>; 
	}
	if (defaultEstimate == null) {
		return(<span style={{ color: "red" }}>-</span>);
	}
	return(<span style={{ color: "red" }}>{defaultEstimate}</span>);
};

const Ago = (value: Date): string => {
	if (!value) {
		return '';
	}
	return formatDistanceToNow(value, { addSuffix: false });
};

function CustomFooterStatusComponent(props: CustomFooterProps) { 
	const { totalTimEstimate, totalTimeOriginalEstimate, totalTimeSpent } = props;
	return (
		<Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
			<Typography variant="body2">totalTimEstimate: {totalTimEstimate}</Typography>
			<Typography variant="body2">totalTimeOriginalEstimate: {totalTimeOriginalEstimate}</Typography>
			<Typography variant="body2">totalTimeSpent: {totalTimeSpent}</Typography>
			<GridPagination />
		</Box>
	);
}

const EstimatorTable: React.FC<{
	data: TicketProps[],
	defaultEstimate: number | null,
	loading: boolean,
	totalTimEstimate: number,
	totalTimeOriginalEstimate: number,
	totalTimeSpent: number
}> = (
	{data, defaultEstimate, loading, totalTimEstimate, totalTimeOriginalEstimate, totalTimeSpent}
) => {
	const theme = useTheme();
	const columns: GridColDef<any>[] = [
//		{ field: 'id', headerName: 'id' },
		{
			field: 'key',
			headerName: 'key',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<Link href={API_URL + '/browse/' + params.value as string} target="_blank" rel="noopener noreferrer">
					{params.value}
				</Link>
			),
			minWidth: 80
		},
		{
			field: 'parentname',
			headerName: 'parent',
			renderCell: (params: GridRenderCellParams<TicketProps>) => {
				if (params.value) {
					return (
						<>
							<Link href={API_URL + '/browse/' + params.row.parentkey as string} target="_blank" rel="noopener noreferrer">
								{params.row.parentkey}
							</Link>: &#x200b;
							<Link href={API_URL + '/browse/' + params.row.parentkey as string} target="_blank" rel="noopener noreferrer">
								{params.value}
							</Link>
						</>
					);
				} else {
					return null
				}
			},
			flex: 2,
			minWidth: 125,
		},
		{ field: 'assignee', headerName: 'assignee', flex: 1 },
		{ field: 'creator', headerName: 'creator', flex: 1 },
		{ field: 'status', headerName: 'status' },
		{
			field: 'summary',
			headerName: 'summary',
			flex: 1,
			minWidth: 125,
		},
		{
			field: 'created',
			headerName: 'created',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<>{Ago(params.value)}</>
			),
		},
		{
			field: 'updated',
			headerName: 'updated',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<>{Ago(params.value)}</>
			),
		},
		{
			field: 'timeestimate',
			headerName: 'Estimate',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<RenderEstimate value={params.value} defaultEstimate={defaultEstimate} />
			),
		},
		{
			field: 'timeoriginalestimate',
			headerName: 'Original Estimate',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<RenderEstimate value={params.value}  defaultEstimate={defaultEstimate}></RenderEstimate>
			),
		},
		{ field: 'timespent', headerName: 'Spent' },
	];
	const getRowClassName = (params: GridRowParams<TicketProps>): string => {
		return params.row.isdone ? 'MuiDataGrid-row-done' : '';
	};
	return (
		<Box sx={{ width: '100%'}}>
			<DataGrid
				sx={{
					'& .MuiDataGrid-row-done': {
						backgroundColor: theme.palette.grey.A400,
					},
				}}
				loading={loading}
				getRowHeight={() => 'auto'}
				rows={data}
				columns={columns}
				getRowClassName={getRowClassName}
				slots={{
					footer: CustomFooterStatusComponent,
				}}
				slotProps={{
					footer: {
						totalTimEstimate,
						totalTimeOriginalEstimate,
						totalTimeSpent,
					} as CustomFooterProps,
					loadingOverlay: {
						variant: 'linear-progress',
						noRowsVariant: 'skeleton',
					},
				}}
				initialState={{
					pagination: {
						paginationModel: {
							pageSize: 100,
						},
					},
				}}
				pageSizeOptions={[5]}
				checkboxSelection={false}
				disableRowSelectionOnClick
				autosizeOnMount
				autosizeOptions={{
					includeHeaders: false,
					includeOutliers: true,
				}}
			/>
		</Box>
	);
}
export default EstimatorTable;