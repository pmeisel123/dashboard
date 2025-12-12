import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { pages } from "@src/Pages/pages";
import { matchRoutes } from "react-router-dom";

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

export const DashboardLoadPageWrapper = styled("div", {
	shouldForwardProp: (prop) => prop !== "height",
})<DashboardIframeProps>(({ height }) => ({
	marginTop: "4px",
	height: height,
	width: "100%",
}));

export const isExternalLink = (url: string) => {
	if (url.match(/^http/)) {
		return true;
	}
	const urlObj = new URL(url, "http://random.com");
	const matches = matchRoutes(pages, {
		pathname: urlObj.pathname,
	});
	const lastMatch = matches ? matches[matches.length - 1] : null;
	if (!lastMatch || !lastMatch.route.element) {
		return true;
	}
	return false;
};
