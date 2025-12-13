import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { StyledTextfit } from "./const";

export const DatePage = () => {
	const [timeString, setTimeString] = useState<string>("");

	useEffect(() => {
		const now = new Date();
		setTimeString(
			now.toLocaleString("en-US", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			}),
		);
		const intervalId = setInterval(() => {
			const now = new Date();
			setTimeString(
				now.toLocaleString("en-US", {
					year: "2-digit",
					month: "2-digit",
					day: "2-digit",
				}),
			);
		}, 1000 * 60);
		return () => {
			clearInterval(intervalId);
		};
	}, []);

	return (
		<Typography noWrap sx={{ height: "100%" }} component={Box}>
			<StyledTextfit>{timeString}</StyledTextfit>
		</Typography>
	);
};
