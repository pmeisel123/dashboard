import {
	Alert,
	Checkbox,
	FormControlLabel,
	FormLabel,
	Grid,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
} from "@mui/material";
import type { ConfigProps, VacationKeyType } from "@src/Api/Types";
import type { ChangeEvent, Dispatch, FC, SetStateAction } from "react";

export const EditMiscellaneousConfigTab: FC<{
	host: string;
	setHost: Dispatch<SetStateAction<string>>;
	port: number;
	setPort: Dispatch<SetStateAction<number>>;
	useSsl: boolean;
	setUseSsl: Dispatch<SetStateAction<boolean>>;
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

	config: ConfigProps;
}> = ({
	host,
	setHost,
	port,
	setPort,
	useSsl,
	setUseSsl,
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
	config,
}) => {
	const handleVacationChange = (event: ChangeEvent<HTMLInputElement>) => {
		setVacationKey(event.target.value as VacationKeyType);
	};
	return (
		<>
			Domain you are running this dashboard on
			<Grid container spacing={1}>
				<Grid>
					<InputLabel id="http">Protocol</InputLabel>
					<Select
						label="Protocol"
						value={useSsl ? "https" : "http"}
						onChange={(event) => {
							setUseSsl(event.target.value == "https");
						}}
					>
						<MenuItem value="http">http</MenuItem>
						<MenuItem value="https">https</MenuItem>
					</Select>
				</Grid>
				<Grid>
					<InputLabel id="http">&nbsp;</InputLabel>
					<div
						style={{
							padding: "18px 0",
							fontSize: "16px",
						}}
					>
						://
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
			{(useSsl != config.USE_SSL || host != config.HOST || port != config.PORT) && (
				<Alert severity="warning">
					<div>
						Changing the host, port, or protocol may require to restart the server and/or change the browser
						url.
					</div>
				</Alert>
			)}
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
