import { Box, Button } from "@mui/material";
import type { AppDispatch, DashboardPageProps, RootState, RoutePageProps } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { DashboardIframe, DashboardLoadPageWrapper, DashboardProgress, ListDashboard } from "@src/Components";
import { pages } from "@src/Pages/pages";
import type { FC } from "react";
import { cloneElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, matchRoutes, useSearchParams } from "react-router-dom";

const LoadPage: FC<{
	url: string;
	height: number;
}> = ({ url, height }) => {
	if (url.match(/imagesfordashboard/)) {
		return <LoadUrlIDashboardImage url={url} height={height} />;
	}
	const urlObj = new URL(url, "http://random.com");
	const matches = matchRoutes(pages, {
		pathname: urlObj.pathname,
	});
	const lastMatch = matches ? matches[matches.length - 1] : null;
	if (!lastMatch || !lastMatch.route.element) {
		return <LoadUrlIframe url={url} height={height} />;
	}
	const params = new URLSearchParams(urlObj.searchParams);
	return cloneElement(lastMatch.route.element, {
		searchParamsOveride: params,
	});
};

const LoadUrlIframe: FC<{
	url: string;
	height: number;
}> = ({ url, height }) => {
	return <DashboardIframe id="dashboardexternal" src={url} allow="fullscreen" height={height} />;
};

const LoadUrlIDashboardImage: FC<{
	url: string;
	height: number;
}> = ({ url, height }) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: height,
				width: "100%",
			}}
		>
			<img src={url} alt={url} style={{ maxWidth: "75%", maxHeight: "75%", transform: "scale(1.5)" }} />
		</Box>
	);
};

const LoadUrl: FC<{
	url: string;
	height: number;
}> = ({ url, height }) => {
	return (
		<Box sx={{ height: height }}>
			{url.match(/^http/) && <LoadUrlIframe url={url} height={height} />}
			{!url.match(/^http/) && (
				<DashboardLoadPageWrapper id="loadPage" height={height}>
					<LoadPage url={url} height={height}></LoadPage>
				</DashboardLoadPageWrapper>
			)}
		</Box>
	);
};

function DashboardPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [dashboard, setDashboard] = useState<string>(searchParams.get("dashboard") || "");
	const [pageNumber, setPageNumber] = useState<number>(parseInt(searchParams.get("pageNumber") || "0"));
	const [page, setPage] = useState<DashboardPageProps | null>(null);

	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth - 52,
				height: window.innerHeight - 72,
			});
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		setDashboard(searchParams.get("dashboard") || "");
	}, [searchParams]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (dashboard) {
			newSearchParams.set("dashboard", dashboard);
		} else {
			newSearchParams.delete("dashboard");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [dashboard]);
	let pages_count = 0;
	if (dashboard && config.DASHBOARDS[dashboard]) {
		pages_count = config.DASHBOARDS[dashboard].pages.length;
		if (config.DASHBOARDS[dashboard].images) {
			pages_count += config.DASHBOARDS[dashboard].images.length;
		}
	}
	const changePageNumber = () => {
		if (dashboard && config.DASHBOARDS[dashboard]) {
			setPageNumber((pageNumber) => {
				if (pageNumber + 1 >= pages_count) {
					return 0;
				} else {
					return pageNumber + 1;
				}
			});
		}
	};
	useEffect(() => {
		if (dashboard && config.DASHBOARDS[dashboard]) {
			ChangePageFromPageNumber();
		}
		const changePageNumberInterval = setInterval(() => {
			if (dashboard && config.DASHBOARDS[dashboard]) {
				changePageNumber();
			}
		}, config.DASHBOARD_SPEED_SECONDS * 1000);
		return () => {
			clearInterval(changePageNumberInterval);
		};
	}, [dashboard]);

	const getPageUrl = (page: DashboardPageProps) => {
		if ("url" in page) {
			let url = page.url;
			if (url.match(/\?/)) {
				url += "&";
			} else {
				url += "?";
			}
			url += "isDashboard=true";
			return url;
		}
		return "";
	};
	const ChangePageFromPageNumber = () => {
		if (dashboard) {
			if (config.DASHBOARDS[dashboard].pages.length > pageNumber) {
				setPage(config.DASHBOARDS[dashboard].pages[pageNumber]);
			} else {
				if (config.DASHBOARDS[dashboard].images && config.DASHBOARDS[dashboard].imagesPath) {
					let image_number = pageNumber - config.DASHBOARDS[dashboard].pages.length;
					setPage({
						name: config.DASHBOARDS[dashboard].images[image_number],
						url: `${config.DASHBOARDS[dashboard].imagesPath}/${config.DASHBOARDS[dashboard].images[image_number]}`,
					});
				}
			}
		}
	};

	useEffect(() => {
		ChangePageFromPageNumber();
	}, [pageNumber]);
	if (dashboard && config.DASHBOARDS[dashboard]) {
		return (
			<>
				<Box>
					<Button
						sx={{
							float: "right",
							outline: "1px solid red",
						}}
						component={Link}
						to={"/dashboard"}
					>
						Exit Dashboard
					</Button>
					Dashboard &gt; {config.DASHBOARDS[dashboard].name} &gt;{" "}
					{pageNumber <= config.DASHBOARDS[dashboard].pages.length && page && <>{page.name}</>}
					<>
						{" "}
						(Page {pageNumber + 1} of {pages_count})
					</>
					<Box sx={{ clear: "both" }} />
				</Box>
				<DashboardProgress speed={config.DASHBOARD_SPEED_SECONDS} />
				{page && "url" in page && <LoadUrl url={getPageUrl(page)} height={windowSize.height} />}
				{page && "split" in page && (
					<Box sx={{ marginTop: "5px" }}>
						{page.pages.map((subpage, index) => {
							const width =
								page.split == "sideways" || page.split == "fourways"
									? windowSize.width / 2
									: windowSize.width;
							const height =
								page.split == "updown" || page.split == "fourways"
									? windowSize.height / 2
									: windowSize.height;
							return (
								<Box
									key={index}
									sx={{
										width: width,
										height: height,
										overflow: "hidden",
										float: "left",
										outline: "1px solid black",
									}}
								>
									<LoadUrl url={getPageUrl(subpage)} height={height} />
								</Box>
							);
						})}
					</Box>
				)}
			</>
		);
	}
	return <ListDashboard setDashboard={setDashboard}></ListDashboard>;
}

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/Dashboard",
		name: "Dashboards",
		element: <DashboardPage />,
		description: (
			<>
				Dashboards are configured within the <Link to="/EditConfig">Edit Config</Link>. When a dashboard is
				loaded, the page will automatically switch between different pages.
				<br />
				This is useful for displaying information on internal office screens.
			</>
		),
	},
];
