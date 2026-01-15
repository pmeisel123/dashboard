import { Checkbox, FormControlLabel, FormLabel, Grid, InputLabel, Radio, RadioGroup, TextField } from "@mui/material";
import type { VacationKeyType } from "@src/Api/Types";
import type { ChangeEvent, Dispatch, FC, SetStateAction } from "react";

export const EditMiscellaneousConfigTab: FC<{
	host: string;
	setHost: Dispatch<SetStateAction<string>>;
	port: number;
	setPort: Dispatch<SetStateAction<number>>;
	vacationKey: VacationKeyType;
	setVacationKey: Dispatch<SetStateAction<VacationKeyType>>;
	allowVacationEdit: boolean;
	setAllowVacationEdit: Dispatch<SetStateAction<boolean>>;
	origVacationEdit: boolean;

	allowConfigEdit: boolean;
	setAllowConfigEdit: Dispatch<SetStateAction<boolean>>;
	origAllowConfigEdit: boolean;

	allowDashboardEdit: boolean;
	setAllowDashboardEdit: Dispatch<SetStateAction<boolean>>;
	origAllowDashboardEdit: boolean;
}> = ({
	host,
	setHost,
	port,
	setPort,
	vacationKey,
	setVacationKey,
	allowVacationEdit,
	setAllowVacationEdit,
	origVacationEdit,
	allowConfigEdit,
	setAllowConfigEdit,
	origAllowConfigEdit,
	allowDashboardEdit,
	setAllowDashboardEdit,
	origAllowDashboardEdit,
}) => {
	const handleVacationChange = (event: ChangeEvent<HTMLInputElement>) => {
		setVacationKey(event.target.value as VacationKeyType);
	};
	return (
		<>
			Domain you are running this dashboard on
			<Grid container spacing={1}>
				<Grid>
					<InputLabel id="http">&nbsp;</InputLabel>
					<div
						style={{
							padding: "18px 0",
							fontSize: "16px",
						}}
					>
						https://
					</div>
				</Grid>
				<Grid>
					<InputLabel id="host">Host</InputLabel>
					<TextField
						id="Host"
						value={host}
						onChange={(event) => {
							setHost(event.target.value);
						}}
						helperText=" "
					/>
				</Grid>
				<Grid>
					<InputLabel id="colon">&nbsp;</InputLabel>
					<div
						style={{
							padding: "18px 0",
							fontSize: "16px",
						}}
					>
						:
					</div>
				</Grid>
				<Grid>
					<InputLabel id="port">Port</InputLabel>
					<TextField
						id="Port"
						value={port}
						type="number"
						onChange={(event) => {
							setPort(parseInt(event.target.value));
						}}
					/>
				</Grid>
			</Grid>
			<FormLabel id="vacationKey">Vacation key: How Jira Users and vacation api link user</FormLabel>
			<RadioGroup
				row
				aria-labelledby="vacationKey"
				name="vacationKey"
				value={vacationKey}
				onChange={handleVacationChange}
			>
				<FormControlLabel value="email" control={<Radio />} label="Person's Email" />
				<FormControlLabel value="name" control={<Radio />} label="Person's Name" />
			</RadioGroup>
			<FormLabel>
				If any of the below options are turned off, they can only be turned on by editting Config.json on the
				filesystem
			</FormLabel>
			<br />
			<FormControlLabel
				control={
					<Checkbox
						checked={allowConfigEdit}
						onChange={(event) => {
							setAllowConfigEdit(event.target.checked);
						}}
						inputProps={{ "aria-label": "controlled" }}
						disabled={!origAllowConfigEdit}
					/>
				}
				label="Allow Edits to this page"
			/>
			<br />
			<FormControlLabel
				control={
					<Checkbox
						checked={allowDashboardEdit}
						onChange={(event) => {
							setAllowDashboardEdit(event.target.checked);
						}}
						inputProps={{ "aria-label": "controlled" }}
						disabled={!origAllowDashboardEdit}
					/>
				}
				label="Allow Edits to the Dashboard Tab"
			/>
			<br />
			<FormControlLabel
				control={
					<Checkbox
						checked={allowVacationEdit}
						onChange={(event) => {
							setAllowVacationEdit(event.target.checked);
						}}
						inputProps={{ "aria-label": "controlled" }}
						disabled={!origVacationEdit}
					/>
				}
				label="Allow Vacation Edits"
			/>
			<br />
		</>
	);
};
