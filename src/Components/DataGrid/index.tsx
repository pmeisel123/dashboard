import type { SxProps, Theme } from "@mui/material";
import { Box } from "@mui/material";
import type {
	DataGridProps,
	GridApi,
	GridColumnVisibilityModel,
	GridFilterModel,
	GridSortModel,
} from "@mui/x-data-grid";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import type { tableSetingsProps, updateGridModelProps } from "@src/Components";
import { defaultTableSettings, getTicketColumns } from "@src/Components";
import type { MutableRefObject } from "react";
import { useEffect, useState } from "react";

interface CustomDataGridProps extends DataGridProps {
	localStorageName: string;
	defaultColumnModel?: tableSetingsProps;
	apiRef?: MutableRefObject<GridApi | null>;
	onFilterModelChange?: (newModel: GridFilterModel) => void;
	sx?: SxProps<Theme>;
	getVisibility?: () => GridColumnVisibilityModel | undefined;
}

export const CustomDataGrid = ({
	localStorageName,
	columns,
	defaultColumnModel,
	getVisibility,
	apiRef,
	onFilterModelChange,
	sx,
	...props
}: CustomDataGridProps) => {
	const [columnModel, setColumnModel] = useState<tableSetingsProps>({
		...defaultTableSettings,
	});
	if (!apiRef) {
		apiRef = useGridApiRef();
	}
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
		if (onFilterModelChange) {
			onFilterModelChange(newModel);
		}
	};

	const handleVisibility = () => {
		if (getVisibility) {
			const return_value = getVisibility();
			if (return_value) {
				return return_value;
			}
		}
		return columnModel.GridColumnVisibilityModel;
	};

	useEffect(() => {
		let newColumnModel: tableSetingsProps = getTicketColumns(localStorageName, [...columns]);
		if (defaultColumnModel) {
			if (
				"GridSortModel" in defaultColumnModel &&
				(!("GridSortModel" in newColumnModel) || !newColumnModel.GridSortModel.length)
			) {
				newColumnModel.GridSortModel = defaultColumnModel.GridSortModel;
			}
			if (
				"GridFilterModel" in defaultColumnModel &&
				(!("GridFilterModel" in newColumnModel) || !newColumnModel.GridFilterModel.items?.length)
			) {
				newColumnModel.GridFilterModel.items = defaultColumnModel.GridFilterModel.items;
			}
			if (
				"GridColumnVisibilityModel" in defaultColumnModel &&
				(!("GridColumnVisibilityModel" in newColumnModel) ||
					!Object.keys(newColumnModel.GridColumnVisibilityModel).length)
			) {
				newColumnModel.GridColumnVisibilityModel = { ...defaultColumnModel.GridColumnVisibilityModel };
			}
		}
		setColumnModel(newColumnModel);
	}, [defaultColumnModel]);
	return (
		<Box sx={{ width: "100%" }}>
			<DataGrid
				sx={[
					{
						"& .MuiDataGrid-cell": {
							display: "flex",
							alignItems: "center",
						},
					},
					...(Array.isArray(sx) ? sx : [sx]),
				]}
				columns={columns}
				getRowHeight={() => "auto"}
				slotProps={{
					loadingOverlay: {
						variant: "linear-progress",
						noRowsVariant: "skeleton",
					},
				}}
				autosizeOnMount
				autosizeOptions={{
					includeHeaders: false,
					includeOutliers: true,
				}}
				columnVisibilityModel={handleVisibility()}
				sortModel={columnModel.GridSortModel}
				filterModel={columnModel.GridFilterModel}
				onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
				onSortModelChange={handleSortModelChange}
				onFilterModelChange={handleFilterChange}
				apiRef={apiRef}
				{...props}
			/>
		</Box>
	);
};
