import { Info } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import type { DashboardProps } from "@src/Api/Types";
import { EditDashboardList, HtmlTooltip } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";

export const EditDashboardConfigTab: FC<{
	dashboards: { [key: string]: DashboardProps };
	setDashboards: Dispatch<SetStateAction<{ [key: string]: DashboardProps }>>;
	dashboardSpeed: number;
	setDashboardSpeed: Dispatch<SetStateAction<number>>;
}> = ({ dashboards, setDashboards, dashboardSpeed, setDashboardSpeed }) => {
	return (
		<>
			<TextField
				id="dashboardspeed"
				value={dashboardSpeed}
				onChange={(event) => {
					setDashboardSpeed(parseInt(event.target.value));
				}}
				type="number"
				fullWidth
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
			<EditDashboardList dashboards={dashboards} setDashboards={setDashboards} />
			<pre>dashboards={JSON.stringify(dashboards, null, 2)}</pre>
		</>
	);
};
