import type { TooltipProps } from "@mui/material";
import { styled, Tooltip, tooltipClasses } from "@mui/material";

interface HtmlTooltipProps extends TooltipProps {
	customWidth?: number | string;
}

export const HtmlTooltip = styled(
	({ className, ...props }: HtmlTooltipProps) => <Tooltip {...props} classes={{ popper: className }} />,
	{
		shouldForwardProp: (prop) => prop !== "customWidth",
	},
)<{ customWidth?: number | string }>(({ theme, customWidth }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(12),
		border: "1px solid #dadde9",
		pointerEvents: "auto",
		maxWidth: customWidth ?? 220,
	},
}));
