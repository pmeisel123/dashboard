import {Box, Typography, useTheme} from '@mui/material';
import { DataGrid, GridPagination, GridFooterContainer, useGridApiRef } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridRowParams, GridSlotsComponentsProps, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Link } from '@mui/material';
import type {TicketProps, CustomFieldsProps} from '@src/Api'
import { formatDistanceToNow } from 'date-fns';
import * as icons from '@mui/icons-material';
import { useEffect, useState } from 'react';


declare const __API_URL__: string;
const API_URL = __API_URL__;
declare const __CUSTOM_FIELDS__: {[key: string]: CustomFieldsProps};



declare module '@mui/x-data-grid' {
	interface FooterPropsOverrides {
		totalTimEstimate: number | null;
		totalTimeOriginalEstimate: number | null;
		totalTimeSpent: number | null;
	}
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

const CustomFooterStatusComponent = (props: NonNullable<GridSlotsComponentsProps['footer']>,) => { 
	const { totalTimEstimate, totalTimeOriginalEstimate, totalTimeSpent } = props;
	return (
		<GridFooterContainer>
			<Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
				<Typography variant="body2">totalTimEstimate: {totalTimEstimate}</Typography>
				<Typography variant="body2">totalTimeOriginalEstimate: {totalTimeOriginalEstimate}</Typography>
				<Typography variant="body2">totalTimeSpent: {totalTimeSpent}</Typography>
				<GridPagination />
			</Box>
		</GridFooterContainer>
	);
};

const TicketTable: React.FC<{
	data: TicketProps[],
	defaultEstimate: number | null,
	loading: boolean,
	totalTimEstimate: number,
	totalTimeOriginalEstimate: number,
	totalTimeSpent: number
}> = (
	{data, defaultEstimate, loading, totalTimEstimate, totalTimeOriginalEstimate, totalTimeSpent}
) => {
	
	const apiRef = useGridApiRef();
	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

	const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
		localStorage.setItem('TicketTableVisibleColumns', JSON.stringify(newModel));
		setColumnVisibilityModel(newModel);
	};

	useEffect(() => {
		const ticketTableVisibleColumns = localStorage.getItem('TicketTableVisibleColumns');
		if (ticketTableVisibleColumns) {
			setColumnVisibilityModel(JSON.parse(ticketTableVisibleColumns));
		}
	}, []);

	const theme = useTheme();
	let columns: GridColDef<any>[] = [
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
			field: 'parentkey',
			headerName: 'parent',
			renderCell: (params: GridRenderCellParams<TicketProps>) => {
				if (params.value) {
					return (
						<>
							<Link href={API_URL + '/browse/' + params.row.parentkey as string} target="_blank" rel="noopener noreferrer">
								{params.row.parentkey}
							</Link>: &#x200b;
							<Link href={API_URL + '/browse/' + params.row.parentkey as string} target="_blank" rel="noopener noreferrer">
								{params.row.parentname}
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
	Object.keys(__CUSTOM_FIELDS__).forEach(custom_field_key => {
		let custom_field_name = __CUSTOM_FIELDS__[custom_field_key].Name;
		let custom_field_type = __CUSTOM_FIELDS__[custom_field_key].Type;
		let custom_field_link_text = __CUSTOM_FIELDS__[custom_field_key].LinkText;
		let custom_field_link_icon = __CUSTOM_FIELDS__[custom_field_key].LinkIcon;

		if (custom_field_type == 'Text') {
			columns.push({
				field: 'customFields.' + custom_field_key,
				headerName: custom_field_name,
				renderCell: (params: GridRenderCellParams<TicketProps>) => {
					const value: string | null = params.row.customFields[custom_field_key];
					if (value) {
						return (
							<>{value}</>
						)
					}
					return (<></>);
				}
			});
		}

		if (custom_field_type == 'Link') {
			columns.push({
				field: 'customFields.' + custom_field_key,
				headerName: custom_field_name,
				renderCell: (params: GridRenderCellParams<TicketProps>) => {
					const value: string | null = params.row.customFields[custom_field_key];
					if (value) {
						if (custom_field_link_icon) {
							const IconComponent = icons[custom_field_link_icon];
							return (
								<Link href={value} target="_blank" rel="noopener noreferrer" title={custom_field_name} color="inherit">
									<IconComponent />
								</Link>
							);
						} else {
							return (
								<Link href={value} target="_blank" rel="noopener noreferrer"  title={custom_field_name}>
									{custom_field_link_text ? custom_field_link_text : custom_field_name}
								</Link>
							);
						}
					}
					return (<></>);
				}
			});
		}
	});
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
					},
					loadingOverlay: {
						variant: 'linear-progress',
						noRowsVariant: 'skeleton',
					},
				}}
				checkboxSelection={false}
				disableRowSelectionOnClick
				autosizeOnMount
				autosizeOptions={{
					includeHeaders: false,
					includeOutliers: true,
				}}
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
				apiRef={apiRef}
			/>
		</Box>
	);
}
export default TicketTable;