import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
declare const __DASHBOARD_SPEED_SECONDS__: number;

export const Progress = styled(LinearProgress)(() => ({
	"& .MuiLinearProgress-bar": {
		animationDuration: __DASHBOARD_SPEED_SECONDS__ + "s",
	},
}));
