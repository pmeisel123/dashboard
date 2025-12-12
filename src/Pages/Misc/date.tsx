import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export const DatePage = () => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const [fontSize, setFontSize] = useState<number>(16); // Default size
	const [timeString, setTimeString] = useState<string>("");

	useEffect(() => {
		const handleResize = () => {
			let parentWidth = 0;
			if (parentRef.current) {
				parentWidth = parentRef.current.clientWidth;
			} else {
				parentWidth = window.innerWidth;
			}
			const newSize = Math.min(parentWidth * 0.1); // 10% width
			setFontSize(newSize);
		};

		handleResize();

		window.addEventListener("resize", handleResize);
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
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<Typography variant="body1" sx={{ fontSize: `${fontSize}px`, textAlign: "center" }}>
			{timeString}
		</Typography>
	);
};
