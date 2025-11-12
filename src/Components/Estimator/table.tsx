import '../../App.css'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, GridPagination } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link } from '@mui/material';
import type {TicketProps} from '../../Api'

const API_URL = __API_URL__;


interface CustomFooterProps {
  totalTimEestimate: number;
  totalTimeOriginalEstimate: number;
  totalTimeSpent: number;
}


const RenderEstimate: React.FC<{value: number | null, defaultEstimate: number}> = ({value, defaultEstimate}) => {
	if (value) {
		return <>{value}</>; 
	}
	return(<span style={{ color: "pink" }}>{defaultEstimate}</span>);
};

function CustomFooterStatusComponent(props: CustomFooterProps) {
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
const EstimatorTable: React.FC<{data: TicketProps[], defaultEstimate: number, loading: boolean}> = ({data, defaultEstimate, loading}) => {
	if (loading) return (<p>Loading data...</p>);
	const totalTimEestimate = data.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0);
	const totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0);
	const totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
	const columns: GridColDef<any>[] = [
		{ field: 'id', headerName: 'id' },
		{
			field: 'key',
			headerName: 'key',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<Link href={API_URL + '/browse/' + params.value as string} target="_blank" rel="noopener noreferrer">
					{params.value}
				</Link>
			),
		},
		{
			field: 'parentname',
			headerName: 'parent',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<Link href={API_URL + '/browse/' + params.row.parentkey as string} target="_blank" rel="noopener noreferrer">
					{params.value}
				</Link>
			),
		},
		{ field: 'assignee', headerName: 'assignee' },
		{ field: 'creator', headerName: 'creator' },
		{ field: 'status', headerName: 'status' },
		{ field: 'summary', headerName: 'summary' },
		{ field: 'created', headerName: 'created' },
		{ field: 'updated', headerName: 'updated' },
		{
			field: 'timeestimate',
			headerName: 'timeestimate',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<RenderEstimate value={params.value} defaultEstimate={defaultEstimate}></RenderEstimate>
			),
		},
		{
			field: 'timeoriginalestimate',
			headerName: 'timeoriginalestimate',
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<RenderEstimate value={params.value}  defaultEstimate={defaultEstimate}></RenderEstimate>
			),
		},
		{ field: 'timespent', headerName: 'timespent' },
	];
	return (
		<Box>
      <DataGrid
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
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
	);
}
export default EstimatorTable;