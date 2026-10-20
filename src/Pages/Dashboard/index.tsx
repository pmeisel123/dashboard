import { Box, Button } from "@mui/material";
import type {
	AnnouncementsType,
	AppDispatch,
	ConfigProps,
	DashboardPageProps,
	RootState,
	RoutePageProps,
} from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { DashboardIframe, DashboardLoadPageWrapper, DashboardProgress, ListDashboard } from "@src/Components";
import { pages } from "@src/Pages/pages";
import type { FC } from "react";
import { cloneElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, matchRoutes, useSearchParams } from "react-router-dom";
import { DashboardScreen } from "./DashboardScreen";

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
	const [pageNumber, setPageNumber] = useState<number>(parseInt(searchParams.get("pageNumber") || "-1"));
	const [counter, setCounter] = useState<number>(0);
	const [page, setPage] = useState<DashboardPageProps | null>(null);
	const [deviceName] = useState<string>(window.localStorage.getItem("deviceName") || "");
	const [announcements, setAnouncements] = useState<AnnouncementsType[]>([]);
	const [announcementsOverride, setAnouncementsOverride] = useState<boolean>(false);
	const [announcementsPageNumber, setAnnouncementsPageNumber] = useState<number>(0);
	const announcementFrequency = 5;

	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
		const configInterval = setInterval(() => {
			dispatch(fetchConfig());
		}, 60000);
		return () => {
			clearInterval(configInterval);
		};
	}, [dispatch]);
	useEffect(() => {
		let newAnnouncements: AnnouncementsType[] = [];
		let newAnnouncementsOverride = false;
		if (config.ANNOUNCEMENTS) {
			config.ANNOUNCEMENTS.forEach((announcement) => {
				if (
					(announcement.dashboard == "" || announcement.dashboard == dashboard) &&
					(announcement.screen_regex == "" || deviceName.match(announcement.screen_regex))
				) {
					newAnnouncements.push(announcement);
					newAnnouncementsOverride = newAnnouncementsOverride || announcement.override;
				}
			});
		}
		setAnouncements(newAnnouncements);
		setAnouncementsOverride(newAnnouncementsOverride);
	}, [config.ANNOUNCEMENTS, deviceName]);
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
	useEffect(() => {
		if (dashboard && config.DASHBOARDS[dashboard]) {
			if (
				pageNumber % announcementFrequency == 0 &&
				!announcementsOverride &&
				announcementsPageNumber < announcements.length
			) {
				setAnnouncementsPageNumber(announcementsPageNumber + 1);
			} else {
				setAnnouncementsPageNumber(0);
				if (pageNumber + 1 >= pages_count) {
					setPageNumber(0);
				} else {
					setPageNumber(pageNumber + 1);
				}
			}
		}
	}, [counter]);
	useEffect(() => {
		const changePageNumberInterval = setInterval(() => {
			if (dashboard && config.DASHBOARDS[dashboard]) {
				setCounter((counter) => counter + 1);
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
	const ChangePageFromPageNumber = (
		announcements: AnnouncementsType[],
		pageNumber: number,
		announcementsOverride: boolean,
		announcementsPageNumber: number,
		config: ConfigProps,
	) => {
		if (dashboard) {
			if (announcementsOverride && announcements.length > 0) {
				const announcement_number = pageNumber % announcements.length;
				setPage({
					name: "Annnouncement: " + announcement_number,
					url: announcements[announcement_number].url,
				});
			} else if (
				pageNumber % announcementFrequency == 0 &&
				!announcementsOverride &&
				announcementsPageNumber < announcements.length
			) {
				setPage({
					name: "Annnouncement: " + announcementsPageNumber,
					url: announcements[announcementsPageNumber].url,
				});
			} else if (config.DASHBOARDS[dashboard].pages.length > pageNumber) {
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
		ChangePageFromPageNumber(announcements, pageNumber, announcementsOverride, announcementsPageNumber, config);
	}, [pageNumber, announcementsPageNumber]);
	if (dashboard && page) {
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
					Dashboard
					{deviceName && <> &gt; {deviceName}</>} &gt; {config.DASHBOARDS[dashboard].name} &gt;{" "}
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
	{
		path: "/DashboardScreen",
		leftNavPath: "/DashboardScreen?force=true",
		name: "Dashboard Screen",
		element: <DashboardScreen />,
		description: <>Used for displaying dashboards on internal office screens.</>,
	},
];
