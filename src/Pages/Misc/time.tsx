import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export const TimePage = () => {
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
			const newSize = Math.min(parentWidth * 0.07); // 8% width
			setFontSize(newSize);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

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
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<Typography variant="body1" sx={{ fontSize: `${fontSize}px`, textAlign: "center" }}>
			{timeString}
		</Typography>
	);
};
