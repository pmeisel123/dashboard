import {
	Box,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { store } from "@src/Api";
import { LeftNav, TopNav, Progress, Duck } from "@src/Components";
import { pages } from "@src/Pages/const";
import DucksPage from "@src/Pages/Ducks";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { matchRoutes } from "react-router";
import {
	useNavigate,
	createBrowserRouter,
	Outlet,
	RouterProvider,
	useLocation,
	useSearchParams,
} from "react-router-dom";
import "./App.css";

declare const __DASHBOARD_DUCKS__: boolean;
const router = createBrowserRouter([
	{
		path: "/",
		element: <Main />,
		children: [...pages, {
			path: '/ducks',
			name: 'Ducks',
			element: <DucksPage />,
			description: <>DUCKS!</>
		}],
	},
]);

const defaultLeftWidth = 150;

function Main() {
	const navigate = useNavigate();
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
	const [isDashboard, setIsDashboard] = useState<boolean>(
		searchParams.get("isDashboard") == "true",
	);
	const [dashboard, setDashboard] = useState<string>(
		searchParams.get("dashboard") || "",
	);
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
			const newSearchParams = new URLSearchParams(
				searchParams.toString(),
			);
			newSearchParams.set("isDashboard", "true");
			setSearchParams(newSearchParams);
			setSideWidth(0);
		} else if( dashboard != "") {
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
	}, [leftNavOpen, isSmallOrLarger, windowSize, isDashboard, dashboard]);
	useEffect(() => {
		setDashboard(searchParams.get('dashboard') || '');
		setIsDashboard(searchParams.get("isDashboard") == "true");
	}, [searchParams]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (isDashboard) {
			newSearchParams.set("isDashboard", "true");
		} else {
			newSearchParams.delete("isDashboard");
		}
		setSearchParams(newSearchParams);
	}, [isDashboard]);

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
	const changeUrl = (url: string) => {
		navigate(url);
	};
	(window as any).changeUrl = changeUrl;

	return (
		<>
			{!isDashboard && !dashboard && (
				<>
					<TopNav
						toggleLeftNav={toggleLeftNav}
						toggleHideTitle={toggleHideTitle}
						hideTitle={hideTitle}
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
				{!isDashboard && !dashboard && !hideTitle && (
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
				{
					isDashboard && (
					<Progress />
				)}
				<Outlet context={{ isDashboard: (isDashboard || !!dashboard) }} />
			</Box>
			{!dashboard && (__DASHBOARD_DUCKS__ || !isDashboard) && (
				<Duck />
			)}
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
