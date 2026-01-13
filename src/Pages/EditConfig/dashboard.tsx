import { Info } from "@mui/icons-material";
import { Checkbox, FormControlLabel, Grid, InputAdornment, InputLabel, TextField } from "@mui/material";
import type { DashboardProps } from "@src/Api/Types";
import { EditDashboardList, HtmlTooltip } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";

export const EditDashboardConfigTab: FC<{
	dashboards: { [key: string]: DashboardProps };
	setDashboards: Dispatch<SetStateAction<{ [key: string]: DashboardProps }>>;
	dashboardSpeed: number;
	setDashboardSpeed: Dispatch<SetStateAction<number>>;
	dashboardDucks: boolean;
	setDashboardDucks: Dispatch<SetStateAction<boolean>>;
}> = ({ dashboards, setDashboards, dashboardSpeed, setDashboardSpeed, dashboardDucks, setDashboardDucks }) => {
	return (
		<Grid container spacing={2}>
			<Grid size={{ xs: 12 }}>
				<InputLabel id="dashboardspeed">Dashboard Speed</InputLabel>
				<TextField
					id="dashboardspeed"
					value={dashboardSpeed}
					onChange={(event) => {
						setDashboardSpeed(parseInt(event.target.value));
					}}
					type="number"
					helperText=" "
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<HtmlTooltip
									title={<>Speed between page loads in the dashboard</>}
									disableInteractive={false}
									arrow
									placement="right"
								>
									<Info style={{ cursor: "pointer" }} color="action" />
								</HtmlTooltip>
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<FormControlLabel
					control={
						<Checkbox
							checked={dashboardDucks}
							onChange={(event) => {
								setDashboardDucks(event.target.checked);
							}}
							inputProps={{ "aria-label": "controlled" }}
						/>
					}
					label="Show ducks on the dashboard (it is fun, so please leave on)"
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<EditDashboardList dashboards={dashboards} setDashboards={setDashboards} />
			</Grid>
		</Grid>
	);
};
