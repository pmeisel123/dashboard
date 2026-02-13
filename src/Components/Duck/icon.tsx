import { Box } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, getHolidayDayString, isSliceRecent } from "@src/Api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getHolidayDuck } from "./const";

export const Duck = () => {
	let default_duck = "ducky.png";
	let default_duck_title = "ducky.png";
	const [max_silly, setMaxSilly] = useState<number>(300);
	const [searchParams] = useSearchParams();
	const [duck, setDuck] = useState<string>(default_duck);
	const [silly, setSilly] = useState<number>(parseInt(searchParams.get("silly") || "300"));
	const [orderSilly] = useState<boolean>(searchParams.get("orderSilly") == "true");
	const [duckTitle, setDuckTitle] = useState<string>("");

	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);

	useEffect(() => {
		setMaxSilly(config.DUCKS.length * 10);
	}, [config]);

	let today = getHolidayDayString(new Date());
	const randomSilly = () => {
		if (orderSilly) {
			setSilly((silly) => {
				if (silly >= config.DUCKS.length - 1) {
					return 0;
				} else {
					return silly + 1;
				}
			});
			return;
		}
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
		if (config.DUCKS.length > silly && config.DUCKS[silly]) {
			setDuck(config.DUCKS[silly]);
			setDuckTitle("silly " + silly);
		} else {
			setDuck(default_duck);
			setDuckTitle(default_duck_title);
		}
	}, [silly]);
	useEffect(() => {
		let faviconLink: HTMLLinkElement | null = document.querySelector('link[rel*="icon"]');

		if (!faviconLink) {
			faviconLink = document.createElement("link");
			faviconLink.type = "image/x-icon"; // Or the appropriate image type
			faviconLink.rel = "shortcut icon"; // Or 'icon'
			document.getElementsByTagName("head")[0].appendChild(faviconLink);
		}
		if (faviconLink) {
			faviconLink.href = "/ducks/" + duck;
		}
	}, [duck]);

	return (
		<Box
			sx={{
				position: "fixed",
				bottom: "10px",
				right: "10px",
			}}
			title={duckTitle}
		>
			<img
				style={{
					maxHeight: "64px",
					maxWidth: "64px",
					opacity: 0.25,
				}}
				src={"/ducks/" + duck}
			/>
		</Box>
	);
};
