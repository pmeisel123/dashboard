import { Box } from "@mui/material";
import { getHolidayDayString } from "@src/Api";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHolidayDuck } from "./const";
declare const __DUCKS__: string[];
const max_silly = __DUCKS__.length * 4;

export const Duck = () => {
	let default_duck = "ducky.png";
	let default_duck_title = "ducky.png";
	const [searchParams] = useSearchParams();
	const [duck, setDuck] = useState<string>(default_duck);
	const [silly, setSilly] = useState<number>(
		parseInt(searchParams.get("silly") || max_silly + ""),
	);
	const [duckTitle, setDuckTitle] = useState<string>("");
	let today = getHolidayDayString(new Date());
	const randomSilly = () => {
		if (searchParams.get("silly") != null) {
			setSilly(parseInt(searchParams.get("silly") || max_silly + ""));
		} else {
			setSilly(Math.floor(Math.random() * max_silly));
		}
	};
	useEffect(() => {
		randomSilly();
		const duckInterval = setInterval(() => {
			randomSilly();
		}, 10000);
		return () => {
			clearInterval(duckInterval);
		};
	}, []);

	useEffect(() => {
		const [duck_title, holiday_duck] = getHolidayDuck(today);
		if (holiday_duck) {
			default_duck_title = duck_title;
			default_duck = holiday_duck;
		}
		if (__DUCKS__.length > silly && __DUCKS__[silly]) {
			setDuck(__DUCKS__[silly]);
			setDuckTitle("silly " + silly);
		} else {
			setDuck(default_duck);
			setDuckTitle(default_duck_title);
		}
	}, [silly]);

	return (
		<Box
			sx={{ position: "fixed", bottom: "10px", right: "10px" }}
			title={duckTitle}
			key={silly}
		>
			<img
				style={{ height: "45px", width: "45px", opacity: 0.25 }}
				src={"/src/assets/ducks/" + duck}
			/>
		</Box>
	);
};
