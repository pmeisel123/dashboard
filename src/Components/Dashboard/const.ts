import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
declare const __DASHBOARD_SPEED_SECONDS__: number;

export const DashboardProgress = styled(LinearProgress)(() => ({
	position: "fixed",
	top: 0,
	left: 0,
	zIndex: 99999,
	width: "100%",
	"& .MuiLinearProgress-bar": {
		animationDuration: __DASHBOARD_SPEED_SECONDS__ + "s",
	},
}));

interface DashboardIframeProps {
	windowSize: {
		width: number;
		height: number;
	};
}

export const DashboardIframe = styled("iframe", {
	shouldForwardProp: (prop) => prop !== "windowSize",
})<DashboardIframeProps>(({ windowSize }) => ({
	position: "fixed",
	top: "48px",
	left: 0,
	width: windowSize.width,
	height: windowSize.height - 48,
	border: "none",
	zIndex: 9999,
}));
