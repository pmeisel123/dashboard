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
			<FormLabel id="vacationKey">
				Vacation key (How Jira Users and vacation api link user (by name or by email)
			</FormLabel>
			<RadioGroup
				row
				aria-labelledby="vacationKey"
				name="vacationKey"
				value={vacationKey}
				onChange={handleVacationChange}
			>
				<FormControlLabel value="email" control={<Radio />} label="Email" />
				<FormControlLabel value="name" control={<Radio />} label="Name" />
			</RadioGroup>
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
				label="Allow Vacation Edits (If turned off this can only be turned on by editting Config.json on the filesystem)"
			/>
		</>
	);
};
