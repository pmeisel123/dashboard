import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
declare const __DASHBOARD_SPEED_SECONDS__: number;

export const DashboardProgress = styled(LinearProgress)(() => ({
	left: 0,
	position: "fixed",
	top: "48px",
	width: "100%",
	zIndex: 99999,
	"& .MuiLinearProgress-bar": {
		animationDuration: __DASHBOARD_SPEED_SECONDS__ + "s",
	},
}));

interface DashboardIframeProps {
	windowSize: {
		height: number;
		width: number;
	};
}

export const DashboardIframe = styled("iframe", {
	shouldForwardProp: (prop) => prop !== "windowSize",
})<DashboardIframeProps>(({ windowSize }) => ({
	border: "none",
	height: windowSize.height - 48,
	left: 0,
	position: "fixed",
	top: "48px",
	width: windowSize.width,
	zIndex: 9999,
}));

export const DashboardLoadPageWrapper = styled("div", {
	shouldForwardProp: (prop) => prop !== "windowSize",
})<DashboardIframeProps>(({ windowSize }) => ({
	border: "none",
	height: windowSize.height - 48,
	left: 0,
	overflow: "auto",
	position: "fixed",
	top: "48px",
	width: windowSize.width,
	zIndex: 9999,
}));
