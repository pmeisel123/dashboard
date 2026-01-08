import { Grid, InputLabel, TextField, RadioGroup, Radio, FormLabel, FormControlLabel } from "@mui/material";
import type { Dispatch, FC, SetStateAction, ChangeEvent } from "react";
import type { VacationKeyType } from '@src/Api/Types';

export const EditMiscellaneousConfigTab: FC<{
	host: string;
	setHost: Dispatch<SetStateAction<string>>;
	port: string;
	setPort: Dispatch<SetStateAction<string>>;
	vacationKey: VacationKeyType;
	setVacationKey: Dispatch<SetStateAction<VacationKeyType>>;
}> = ({ host, setHost, port, setPort, vacationKey, setVacationKey}) => {
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
						value={port + ""}
						onChange={(event) => {
							setPort(event.target.value);
						}}
					/>
				</Grid>
			</Grid>
			<FormLabel id="vacationKey">Vacation key (How Jira Users and vacation api link user (by name or by email)</FormLabel>
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
		</>
	);
};
