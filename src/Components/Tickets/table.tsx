import * as icons from "@mui/icons-material";
import { Box, Link, Typography, useTheme } from "@mui/material";
import type {
	GridColDef,
	GridColumnVisibilityModel,
	GridRenderCellParams,
	GridRowParams,
	GridSlotsComponentsProps,
} from "@mui/x-data-grid";
import { GridFooterContainer, GridPagination } from "@mui/x-data-grid";
import type { BranchesAndTicket, CustomFieldsProps, TicketProps, UsersGroupProps } from "@src/Api";
import { GetBranchCreator } from "@src/Api";
import type { tableSetingsProps } from "@src/Components";
import { Ago, CustomDataGrid, defaultTableSettings } from "@src/Components";
import type { FC } from "react";
import { Fragment } from "react";
import { useLocation } from "react-router-dom";

declare const __API_URL__: string;
declare const __CUSTOM_FIELDS__: { [key: string]: CustomFieldsProps };

declare module "@mui/x-data-grid" {
	interface FooterPropsOverrides {
		// this interface is used by const CustomFooterStatusComponent = (props: NonNullable<GridSlotsComponentsProps['footer']>,) => {
		totalTimEstimate: number | null;
		totalTimeOriginalEstimate: number | null;
		totalTimeSpent: number | null;
	}
}

const RenderEstimate: FC<{
	value: number | null;
	defaultEstimate: number | null;
}> = ({ value, defaultEstimate }) => {
	if (value != null) {
		return <>{value}</>;
	}
	if (defaultEstimate == null) {
		return <span style={{ color: "red" }}>-</span>;
	}
	return <span style={{ color: "red" }}>{defaultEstimate}</span>;
};

const CustomFooterStatusComponent = (props: NonNullable<GridSlotsComponentsProps["footer"]>) => {
	const { totalTimEstimate, totalTimeOriginalEstimate, totalTimeSpent } = props;
	return (
		<GridFooterContainer>
			<Box
				sx={{
					p: 1,
					display: "flex",
					justifyContent: "flex-end",
					gap: 2,
				}}
			>
				<Typography variant="body2">totalTimEstimate: {totalTimEstimate}</Typography>
				<Typography variant="body2">totalTimeOriginalEstimate: {totalTimeOriginalEstimate}</Typography>
				<Typography variant="body2">totalTimeSpent: {totalTimeSpent}</Typography>
			</Box>
			<GridPagination />
		</GridFooterContainer>
	);
};

const TicketTable: FC<{
	tickets: TicketProps[];
	defaultEstimate: number | null;
	loading: boolean;
	totalTimEstimate: number;
	totalTimeOriginalEstimate: number;
	totalTimeSpent: number;
	isDashboard?: boolean;
	defaultSort?: string;
	defaultSortDirection?: "asc" | "desc";
	user?: string;
	allJiraUsersGroups: UsersGroupProps;
	ticketsBranches: BranchesAndTicket;
}> = ({
	tickets,
	defaultEstimate,
	loading,
	totalTimEstimate,
	totalTimeOriginalEstimate,
	totalTimeSpent,
	isDashboard,
	defaultSort,
	defaultSortDirection,
	user,
	allJiraUsersGroups,
	ticketsBranches,
}) => {
	const location = useLocation();
	const localStorageName = "TicketTableColumns." + location.pathname;

	const theme = useTheme();
	let columns: GridColDef<any>[] = [
		{
			field: "key",
			headerName: "key",
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<Link
					href={(__API_URL__ + "/browse/" + params.value) as string}
					target="_blank"
					rel="noopener noreferrer"
				>
					{params.value}
				</Link>
			),
			minWidth: 80,
		},
		{
			field: "summary",
			headerName: "summary",
			flex: 2,
			minWidth: 125,
		},
		{
			field: "parentkey",
			headerName: "parent",
			renderCell: (params: GridRenderCellParams<TicketProps>) => {
				if (params.value) {
					return (
						<>
							<Link
								href={(__API_URL__ + "/browse/" + params.row.parentkey) as string}
								target="_blank"
								rel="noopener noreferrer"
							>
								{params.row.parentkey}
							</Link>
							: &#x200b;
							<Link
								href={(__API_URL__ + "/browse/" + params.row.parentkey) as string}
								target="_blank"
								rel="noopener noreferrer"
							>
								{params.row.parentname}
							</Link>
						</>
					);
				} else {
					return null;
				}
			},
			flex: 2,
			minWidth: 125,
		},
		{ field: "assignee", headerName: "assignee", flex: 1 },
		{ field: "creator", headerName: "creator", flex: 1 },
		{
			field: "labels",
			headerName: "labels",
			flex: 1,
			valueGetter: (_params, row) => {
				if (row.labels) {
					return row.labels.join(",");
				}
			},
		},
		{ field: "status", headerName: "status" },
		{
			field: "created",
			headerName: "created",
			renderCell: (params: GridRenderCellParams<TicketProps>) => <>{Ago(params.value)}</>,
		},
		{
			field: "updated",
			headerName: "updated",
			renderCell: (params: GridRenderCellParams<TicketProps>) => <>{Ago(params.value)}</>,
		},
		{
			field: "timeestimate",
			headerName: "Estimate",
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<RenderEstimate value={params.value} defaultEstimate={defaultEstimate} />
			),
		},
		{
			field: "timeoriginalestimate",
			headerName: "Original Estimate",
			renderCell: (params: GridRenderCellParams<TicketProps>) => (
				<RenderEstimate value={params.value} defaultEstimate={defaultEstimate}></RenderEstimate>
			),
		},
		{ field: "timespent", headerName: "Spent" },
	];
	Object.keys(__CUSTOM_FIELDS__).forEach((custom_field_key) => {
		let custom_field_name = __CUSTOM_FIELDS__[custom_field_key].Name;
		let custom_field_type = __CUSTOM_FIELDS__[custom_field_key].Type;

		if (custom_field_type == "Text") {
			columns.push({
				field: "customFields_" + custom_field_key,
				headerName: custom_field_name,
				valueGetter: (_params, row) => {
					return row.customFields[custom_field_key];
				},
			});
		}

		if (custom_field_type == "User") {
			// Technically "User" can be multiple people, but generally only 1 person
			columns.push({
				field: "customFields_" + custom_field_key,
				headerName: custom_field_name,
				valueGetter: (_params, row) => {
					if (row) {
						const value: string[] | null = row.customFields[custom_field_key] as string[] | null;
						if (value) {
							return value.join(", ");
						}
					}
				},
			});
		}

		if (custom_field_type == "Link") {
			columns.push({
				field: "customFields_" + custom_field_key,
				headerName: custom_field_name,
				valueGetter: (_params, row) => {
					return row.customFields[custom_field_key];
				},
				renderCell: (params: GridRenderCellParams<TicketProps>) => {
					const value: string | null = params.row.customFields[custom_field_key];
					if (value) {
						const current_field_props = __CUSTOM_FIELDS__[custom_field_key];

						const custom_field_link_icon =
							"LinkIcon" in current_field_props ? current_field_props.LinkIcon : undefined;
						const link_text =
							"LinkText" in current_field_props ? current_field_props.LinkText : custom_field_name;

						if (custom_field_link_icon) {
							const IconComponent = icons[custom_field_link_icon];
							return (
								<Link
									href={value}
									target="_blank"
									rel="noopener noreferrer"
									title={custom_field_name}
									color="inherit"
								>
									<IconComponent />
								</Link>
							);
						} else {
							return (
								<Link href={value} target="_blank" rel="noopener noreferrer" title={custom_field_name}>
									{link_text}
								</Link>
							);
						}
					}
					return <></>;
				},
			});
		}
	});

	if (ticketsBranches && Object.keys(ticketsBranches.branches).length) {
		columns.push({
			field: "branches",
			headerName: "Git Branches",
			flex: 2,
			valueGetter: (_params, row) => {
				const ticket_branches = ticketsBranches.tickets[row.key];
				if (ticket_branches) {
					let names = "";
					Object.entries(ticket_branches).map(([_key, ticket_branch]) => {
						names += ticket_branch.name;
					});
					return names;
				}
			},
			renderCell: (params: GridRenderCellParams<TicketProps>) => {
				const ticket_branches = ticketsBranches.tickets[params.row.key];
				if (ticket_branches) {
					return (
						<>
							{Object.entries(ticket_branches).map(([key, ticket_branch]) => {
								const url = ticket_branch.repo.url + "/tree/" + ticket_branch.name;
								return (
									<Link key={key} href={url} target={"_blank"}>
										{ticket_branch.name}
										<br />
									</Link>
								);
							})}
						</>
					);
				}
			},
		});

		columns.push({
			field: "branches2",
			headerName: "Git Branches Owners",
			flex: 2,
			valueGetter: (_params, row) => {
				const ticket_branches = ticketsBranches.tickets[row.key];
				if (ticket_branches) {
					let names = "";
					Object.entries(ticket_branches).map(([_key, ticket_branch]) => {
						if (ticket_branch.branch.creator) {
							const creator = GetBranchCreator(ticket_branch.branch.creator, allJiraUsersGroups);
							names += creator ? creator.name : "";
						}
					});
					return names;
				}
			},
			renderCell: (params: GridRenderCellParams<TicketProps>) => {
				const ticket_branches = ticketsBranches.tickets[params.row.key];
				if (ticket_branches) {
					return (
						<>
							{Object.entries(ticket_branches).map(([key, ticket_branch]) => {
								if (ticket_branch.branch.creator) {
									const creator = GetBranchCreator(ticket_branch.branch.creator, allJiraUsersGroups);
									const name = creator ? creator.name : "";
									return (
										<Fragment key={key}>
											{name}
											<br />
										</Fragment>
									);
								} else {
									<Fragment key={key}>
										<br />
									</Fragment>;
								}
							})}
						</>
					);
				}
			},
		});
	}

	const defaultColumnModel: tableSetingsProps = {
		...defaultTableSettings,
	};
	if (defaultSort && isDashboard) {
		if (defaultSortDirection == "desc") {
			defaultColumnModel.GridSortModel = [{ field: defaultSort, sort: "desc" }];
		} else {
			defaultColumnModel.GridSortModel = [{ field: defaultSort, sort: "asc" }];
		}
	}

	const getRowClassName = (params: GridRowParams<TicketProps>): string => {
		if (params.row.isdone) {
			return "MuiDataGrid-row-done";
		}
		if (user && params.row.assignee_id != user) {
			return "MuiDataGrid-row-notowner";
		}
		return params.row.isdone ? "MuiDataGrid-row-done" : "";
	};
	const getVisibility = () => {
		if (isDashboard) {
			let hide_columns = columns.reduce((tmp, column) => {
				let field_name = column.field as string;
				tmp[field_name] = [
					"key",
					"parentkey",
					"assignee",
					"status",
					"labels",
					"parentkey",
					"timeestimate",
					"summary",
					"creator",
					"created",
					"updated",
				].includes(field_name);
				return tmp;
			}, {} as GridColumnVisibilityModel);
			return hide_columns;
		}
	};
	return (
		<Box sx={{ width: "100%" }}>
			<CustomDataGrid
				sx={{
					"& .MuiDataGrid-row-notowner": {
						backgroundColor: theme.palette.grey.A200,
					},
					"& .MuiDataGrid-row-done": {
						backgroundColor: theme.palette.grey.A400,
					},
				}}
				loading={loading}
				rows={tickets}
				columns={columns}
				getRowClassName={getRowClassName}
				defaultColumnModel={defaultColumnModel}
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
						variant: "linear-progress",
						noRowsVariant: "skeleton",
					},
				}}
				checkboxSelection={false}
				disableRowSelectionOnClick
				getVisibility={getVisibility}
				localStorageName={localStorageName}
			/>
		</Box>
	);
};
export default TicketTable;
