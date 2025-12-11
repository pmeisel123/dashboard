import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
declare const __DASHBOARD_SPEED_SECONDS__: number;

export const DashboardProgress = styled(LinearProgress)(() => ({
	bottom: "0",
	left: 0,
	position: "fixed",
	width: "100%",
	zIndex: 99999,
	"& .MuiLinearProgress-bar": {
		animationDuration: __DASHBOARD_SPEED_SECONDS__ + "s",
	},
}));

interface DashboardIframeProps {
	height: number;
}

export const DashboardIframe = styled("iframe", {
	shouldForwardProp: (prop) => prop !== "height",
})<DashboardIframeProps>(({ height }) => ({
	border: 0,
	display: "block",
	marginTop: "4px",
	height: height,
	width: "100%",
}));

export const DashboardLoadPageWrapper = styled("div")(() => ({
	marginTop: "4px",
	width: "100%",
}));
