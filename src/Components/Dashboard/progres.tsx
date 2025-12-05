import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
declare const __DASHBOARD_SPEED_SECONDS__: number;

export const Progress = styled(LinearProgress)(() => ({
	position: "fixed",
	top: 0,
	left: 0,
	zIndex: 99999,
	width: "100%",
	"& .MuiLinearProgress-bar": {
		animationDuration: __DASHBOARD_SPEED_SECONDS__ + "s",
	},
}));
