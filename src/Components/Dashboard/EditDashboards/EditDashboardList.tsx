import { Add, Delete } from "@mui/icons-material";
import { Box, Grid, IconButton, InputLabel, TextField, Tooltip } from "@mui/material";
import type { DashboardPageProps, DashboardProps, EditableRow } from "@src/Api/Types";
import { UniqueTextFieldFieldKey } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
import { EditPages } from "./EditPages";

export const EditDashboardList: FC<{
	dashboards: { [key: string]: DashboardProps };
	setDashboards: Dispatch<SetStateAction<{ [key: string]: DashboardProps }>>;
}> = ({ dashboards, setDashboards }) => {
	const [rows, setRows] = useState<EditableRow[]>(() =>
		Object.keys(dashboards)
			.sort()
			.map((key) => ({
				key: key,
			})),
	);
	const updateRowKey = (index: number, newKey: string) => {
		const current_key = rows[index].key;
		if (current_key != newKey) {
			const new_rows = [...rows];
			new_rows[index].key = newKey;
			setRows(new_rows);
			const newItems = { ...dashboards };
			newItems[newKey] = {
				...newItems[current_key],
				key: newKey,
			};
			delete newItems[current_key];
			setDashboards(newItems);
		}
	};

	const deletRow = (index: number) => {
		const oldkey = rows[index].key;
		const newItems = { ...dashboards };
		delete newItems[oldkey];
		setDashboards(newItems);
		const new_rows = [...rows];
		new_rows.splice(index, 1);
		setRows(new_rows);
	};

	const addRow = () => {
		const newItems = { ...dashboards };
		const newKey = "";
		if (!newItems[newKey]) {
			newItems[newKey] = {
				key: newKey,
				name: "",
				pages: [],
			};
		}
		setDashboards(newItems);
		const new_rows = [...rows];
		new_rows.push({
			key: newKey,
		});
		setRows(new_rows);
	};

	const updateName = (index: number, newValue: string) => {
		const current_key = rows[index].key;
		const newItems = { ...dashboards };
		newItems[current_key] = {
			...newItems[current_key],
			name: newValue,
		};
		setDashboards(newItems);
	};

	const getUpdatePages = (index: number) => {
		return (pages: DashboardPageProps[]) => {
			const current_key = rows[index].key;
			const newItems = { ...dashboards };
			newItems[current_key] = {
				...newItems[current_key],
				pages: [...pages],
			};
			setDashboards(newItems);
		};
	};
	return (
		<>
			<InputLabel id="dashboards">
				Dashboards
				<Tooltip title={dashboards[""] ? "There is already a blank Dashboard Name" : ""} arrow>
					<span>
						<IconButton edge="end" aria-label="delete" onClick={() => addRow()} disabled={!!dashboards[""]}>
							<Add titleAccess="Add" />
						</IconButton>
					</span>
				</Tooltip>
			</InputLabel>
			{rows.map((item, index) => {
				const key = item.key;
				return (
					<Box sx={{ border: "1px solid gray", marginBottom: "10px", padding: "10px 0" }} key={index}>
						<Grid container spacing={2} sx={{ width: "100%" }}>
							<Grid sx={{ width: "30px", paddingTop: "7px" }}>
								<InputLabel id="key">&nbsp;</InputLabel>
								<IconButton aria-label="delete" onClick={() => deletRow(index)}>
									<Delete titleAccess="Delete" />
								</IconButton>
							</Grid>
							<Grid size={{ xs: 12, md: 3 }}>
								<InputLabel id="key">Key</InputLabel>
								<UniqueTextFieldFieldKey
									object={dashboards}
									updateRow={updateRowKey}
									currentKey={key}
									index={index}
									disabled={false}
									key={index}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 8 }}>
								<InputLabel id="namne">Name</InputLabel>
								<TextField
									value={dashboards[key].name}
									onChange={(event) => {
										updateName(index, event.target.value);
									}}
								/>
							</Grid>
						</Grid>
						<EditPages pages={dashboards[key].pages} setPages={getUpdatePages(index)} subPage={false} />
					</Box>
				);
			})}
			<pre>dashboards={JSON.stringify(dashboards, null, 2)}</pre>
		</>
	);
};
