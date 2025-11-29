import type { GridColumnVisibilityModel, GridSortModel, GridColDef, GridFilterModel  } from '@mui/x-data-grid';

export interface tableSetingsProps {
	'GridColumnVisibilityModel': GridColumnVisibilityModel,
	'GridSortModel': GridSortModel,
	'GridFilterModel': GridFilterModel
}

interface updateGridColumnVisibilityModelProps {
	column: 'GridColumnVisibilityModel',
	newModel: GridColumnVisibilityModel
}

interface updateGridSortModelProps {
	column: 'GridSortModel',
	newModel: GridSortModel
}

interface updateGridFilterModelProps {
	column: 'GridFilterModel',
	newModel: GridFilterModel
}

export type updateGridModelProps = updateGridColumnVisibilityModelProps | updateGridSortModelProps | updateGridFilterModelProps;


export const defaultTableSettings: tableSetingsProps = {
	'GridColumnVisibilityModel': {},
	'GridSortModel': [],
	'GridFilterModel': {items: []},
};

export const getTicketColumns = (localStorageName: string, columns: GridColDef<any>[]): tableSetingsProps => {
	const ticketTableColumns = localStorage.getItem(localStorageName);
	if (ticketTableColumns) {
		// Make sure there is at least one visible column
		let columnModel: tableSetingsProps = JSON.parse(ticketTableColumns) as tableSetingsProps;
		let visible = columnModel.GridColumnVisibilityModel;
		if (
			visible &&
			Object.keys(visible).length == Object.keys(columns).length &&
			Object.values(visible).every(value => !value)
		) {
			const first_column_name = Object.keys(visible)[0];
			visible[first_column_name] = true;
		}
		return(columnModel);
	}
	return { ...defaultTableSettings };
};

export const allGroups = 'All';