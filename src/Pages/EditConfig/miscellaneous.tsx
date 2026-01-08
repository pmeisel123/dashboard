import { Grid, InputLabel, TextField } from "@mui/material";
import type { Dispatch, FC, SetStateAction } from "react";

export const EditMiscellaneousConfigTab: FC<{
	host: string;
	setHost: Dispatch<SetStateAction<string>>;
	port: string;
	setPort: Dispatch<SetStateAction<string>>;
}> = ({ host, setHost, port, setPort }) => {
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
		</>
	);
};
