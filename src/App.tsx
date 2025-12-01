import { Box, Typography, useMediaQuery, useTheme, Button } from "@mui/material";
import { store } from "@src/Api";
import { LeftNav, TopNav } from "@src/Components";
import { pages } from "@src/Pages/const";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { matchRoutes } from "react-router";
import {
	createBrowserRouter,
	Outlet,
	RouterProvider,
	useLocation,
	useSearchParams
} from "react-router-dom";
import "./App.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Main />,
		children: pages,
	},
]);

const defaultLeftWidth = 150;

function Main() {
	const theme = useTheme();
	const isSmallOrLarger = useMediaQuery(theme.breakpoints.up("sm"));
	const [leftNavOpen, setLeftNavOpen] = useState<boolean>(isSmallOrLarger);
	const [sideWidth, setSideWidth] = useState<number>(defaultLeftWidth);
	const [currentDescription, setCurrentDescription] = useState<JSX.Element>();
	const [currentName, setName] = useState<String>();
	const [hideTitle, setHideTitle] = useState<boolean>(
		window.localStorage.getItem("hideTitle") == "true",
	);
	const [searchParams, setSearchParams] = useSearchParams();
	const [isDashboard, setIsDashboard] = useState<boolean>(searchParams.get("isDashboard") == 'true');
	const location = useLocation();
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const toggleLeftNav = () => {
		setLeftNavOpen(!leftNavOpen);
	};
	const toggleHideTitle = () => {
		window.localStorage.setItem("hideTitle", (!hideTitle).toString());
		setHideTitle(!hideTitle);
	};
	useEffect(() => {
		if (isDashboard) {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			newSearchParams.set("isDashboard", 'true');
			setSearchParams(newSearchParams);
			setSideWidth(0);
		} else if (!isSmallOrLarger) {
			let tmp_width = windowSize.width * 0.75;
			if (tmp_width > defaultLeftWidth * 2) {
				tmp_width = defaultLeftWidth * 2;
			}
			setSideWidth(tmp_width);
		} else if (leftNavOpen && isSmallOrLarger) {
			setSideWidth(defaultLeftWidth);
		} else {
			setSideWidth(0);
		}
	}, [leftNavOpen, isSmallOrLarger, windowSize, isDashboard]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (isDashboard) {
			newSearchParams.set("isDashboard", 'true');
		} else {
			newSearchParams.delete("isDashboard");
		}
		setSearchParams(newSearchParams);
	}, [isDashboard])

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		const route = matchRoutes(pages, {
			pathname: window.location.pathname,
		});
		let title = "Dashboard";
		if (window.location.pathname != "/" && route && route.length == 1) {
			setCurrentDescription(route[0].route.description);
			setName(route[0].route.name);
			title += " - " + route[0].route.name;
		} else {
			setCurrentDescription(<></>);
			setName("");
		}
		document.title = title;
	}, [location]);

	return (
		<>
			{isDashboard && (
				<Box sx={{position: 'absolute', top: 20, right: 30, zIndex: 99999, background: '#fff', outline: '1px solid red'}}>
					<Button onClick={() => {setIsDashboard(false)}}>Exit Dashboard</Button>
				</Box>
			)}
			{!isDashboard && (
				<>
			<TopNav
				toggleLeftNav={toggleLeftNav}
				toggleHideTitle={toggleHideTitle}
				hideTitle={hideTitle}
				setIsDashboard={setIsDashboard}
			></TopNav>
			<LeftNav
				open={leftNavOpen}
				setLeftNavOpen={setLeftNavOpen}
				width={sideWidth}
			></LeftNav>
				</>
			)}
			<Box
				sx={{
					paddingLeft: isSmallOrLarger ? sideWidth + 20 + "px" : 0,
					transition: "padding-left 0.1s",
				}}
			>
				{!isDashboard && !hideTitle && (
					<>
						<Typography variant="h6" component="div">
							{currentName}
						</Typography>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							sx={{ padding: "10px 25px 25px 25px" }}
						>
							{currentDescription}
						</Typography>
					</>
				)}
				<Outlet context={{isDashboard: isDashboard}} />
			</Box>
		</>
	);
}

function App() {
	return (
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	);
}

export default App;
