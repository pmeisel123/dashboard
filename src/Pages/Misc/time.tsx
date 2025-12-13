import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { StyledTextfit } from "./const";

export const TimePage = () => {
	const [timeString, setTimeString] = useState<string>("");

	useEffect(() => {
		const intervalId = setInterval(() => {
			const now = new Date();
			setTimeString(
				now.toLocaleString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: true,
				}),
			);
		});
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
