import type {
	GridColDef,
	GridColumnVisibilityModel,
	GridFilterModel,
	GridSortModel,
} from "@mui/x-data-grid";

export interface tableSetingsProps {
	GridColumnVisibilityModel: GridColumnVisibilityModel;
	GridSortModel: GridSortModel;
	GridFilterModel: GridFilterModel;
}

interface updateGridColumnVisibilityModelProps {
	column: "GridColumnVisibilityModel";
	newModel: GridColumnVisibilityModel;
}

interface updateGridSortModelProps {
	column: "GridSortModel";
	newModel: GridSortModel;
}

interface updateGridFilterModelProps {
	column: "GridFilterModel";
	newModel: GridFilterModel;
}

export type updateGridModelProps =
	| updateGridColumnVisibilityModelProps
	| updateGridSortModelProps
	| updateGridFilterModelProps;

export const defaultTableSettings: tableSetingsProps = {
	GridColumnVisibilityModel: {},
	GridSortModel: [],
	GridFilterModel: { items: [] },
};

export const getTicketColumns = (
	localStorageName: string,
	columns: GridColDef<any>[],
): tableSetingsProps => {
	const ticketTableColumns = localStorage.getItem(localStorageName);
	if (ticketTableColumns) {
		// Make sure there is at least one visible column
		let columnModel: tableSetingsProps = JSON.parse(
			ticketTableColumns,
		) as tableSetingsProps;
		let visible = columnModel.GridColumnVisibilityModel;
		if (
			visible &&
			Object.keys(visible).length >=
				Object.keys(columns).length &&
			Object.values(visible).every((value) => !value)
		) {
			let column_name = "__";
			let col = 0;
			while (column_name.match(/^__/)) {
				column_name = Object.keys(visible)[col];
				visible[column_name] = true;
				col++;
			}
		}
		return columnModel;
	}
	return { ...defaultTableSettings };
};

export const allGroups = "All";
