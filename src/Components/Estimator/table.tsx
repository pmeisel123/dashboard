import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, GridPagination } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link } from '@mui/material';
import type {TicketProps} from '/src/Api'
import { formatDistanceToNow } from 'date-fns';

const API_URL = __API_URL__; // @ts-ignore


interface CustomFooterProps {
  totalTimEestimate: number;
  totalTimeOriginalEstimate: number;
  totalTimeSpent: number;
}


const RenderEstimate: React.FC<{value: number | null, defaultEstimate: number}> = ({value, defaultEstimate}) => {
	if (value) {
		return <>{value}</>; 
	}
	return(<span style={{ color: "red" }}>{defaultEstimate}</span>);
};

const Ago = (value: Date): string => {
	if (!value) {
		return '';
	}
	return formatDistanceToNow(value, { addSuffix: false });
};

const CustomFooterStatusComponent = (props: CustomFooterProps) => {
	const { totalTimEestimate, totalTimeOriginalEstimate, totalTimeSpent } = props;
	return (
		<Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
			<Typography variant="body2">totalTimEestimate: {totalTimEestimate}</Typography>
			<Typography variant="body2">totalTimeOriginalEstimate: {totalTimeOriginalEstimate}</Typography>
			<Typography variant="body2">totalTimeSpent: {totalTimeSpent}</Typography>
			<GridPagination />
		</Box>
	);
}

const EstimatorTable: React.FC<{data: TicketProps[], defaultEstimate: number, loading: boolean, fudgeFactor: number}> = ({data, defaultEstimate, loading, fudgeFactor}) => {
	const totalTimEestimate = data.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0) + fudgeFactor;
	const totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0) + fudgeFactor;
	const totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
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
			flex: 1,
			minWidth: 125,
		},
		{ field: 'assignee', headerName: 'assignee' },
		{ field: 'creator', headerName: 'creator' },
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
	return (
		<Box sx={{ width: '100%'}}>
			<DataGrid
				loading={loading}
				getRowHeight={() => 'auto'}
				rows={data}
				columns={columns}
				slots={{
					footer: CustomFooterStatusComponent,
				}}
				slotProps={{
					footer: {
						totalTimEestimate,
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