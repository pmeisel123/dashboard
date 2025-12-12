import { Box, Button } from "@mui/material";
import type { DashboardPageProps, DashboardProps } from "@src/Api";
import { DashboardIframe, DashboardLoadPageWrapper, DashboardProgress, ListDashboard } from "@src/Components";
import { pages } from "@src/Pages/const";
import type { FC } from "react";
import { cloneElement, useEffect, useState } from "react";
import { Link, matchRoutes, useSearchParams } from "react-router-dom";

declare const __DASHBOARDS__: { [key: string]: DashboardProps };
declare const __DASHBOARD_SPEED_SECONDS__: number;

const LoadPage: FC<{
	url: string;
	height: number;
}> = ({ url, height }) => {
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

const LoadUrl: FC<{
	url: string;
	height: number;
}> = ({ url, height }) => {
	return (
		<>
			<DashboardProgress />
			{url.match(/^http/) && <LoadUrlIframe url={url} height={height} />}
			{!url.match(/^http/) && (
				<DashboardLoadPageWrapper id="loadPage">
					<LoadPage url={url} height={height}></LoadPage>
				</DashboardLoadPageWrapper>
			)}
		</>
	);
};

function DashboardPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [dashboard, setDashboard] = useState<string>(searchParams.get("dashboard") || "");
	const [pageNumber, setPageNumber] = useState<number>(parseInt(searchParams.get("pageNumber") || "0"));
	const [page, setPage] = useState<DashboardPageProps | null>(null);
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth - 50,
				height: window.innerHeight - 62,
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
	if (dashboard && __DASHBOARDS__[dashboard]) {
		pages_count = __DASHBOARDS__[dashboard].pages.length;
	}
	const changePageNumber = () => {
		if (dashboard && __DASHBOARDS__[dashboard]) {
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
		if (dashboard && __DASHBOARDS__[dashboard]) {
			ChangePageFromPageNumber();
		}
		const changePageNumberInterval = setInterval(() => {
			if (dashboard && __DASHBOARDS__[dashboard]) {
				changePageNumber();
			}
		}, __DASHBOARD_SPEED_SECONDS__ * 1000);
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
			setPage(__DASHBOARDS__[dashboard].pages[pageNumber]);
		}
	};

	useEffect(() => {
		ChangePageFromPageNumber();
	}, [pageNumber]);
	if (dashboard && __DASHBOARDS__[dashboard]) {
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
					Dashboard &gt; {__DASHBOARDS__[dashboard].name} &gt;{" "}
					{__DASHBOARDS__[dashboard].pages[pageNumber].name}
					<>
						{" "}
						(Page {pageNumber + 1} of {__DASHBOARDS__[dashboard].pages.length})
					</>
					<Box sx={{ clear: "both" }} />
				</Box>
				{page && "url" in page && <LoadUrl url={getPageUrl(page)} height={windowSize.height} />}
				{page && "split" in page && page.split == "sideways" && (
					<>
						{page.pages.map((subpage, index) => (
							<Box
								key={index}
								sx={{
									width: windowSize.width / 2,
									height: windowSize.height,
									overflow: "hidden",
									float: "left",
									outline: "1px solid black",
								}}
							>
								<LoadUrl url={getPageUrl(subpage)} height={windowSize.height} />
							</Box>
						))}
					</>
				)}
				{page && "split" in page && page.split == "updown" && (
					<>
						{page.pages.map((subpage, index) => (
							<Box
								key={index}
								sx={{
									width: windowSize.width,
									height: windowSize.height / 2,
									overflow: "hidden",
									float: "left",
									outline: "1px solid black",
								}}
							>
								<LoadUrl url={getPageUrl(subpage)} height={windowSize.height} />
							</Box>
						))}
					</>
				)}
				{page && "split" in page && page.split == "fourways" && (
					<>
						{page.pages.map((subpage, index) => (
							<Box
								key={index}
								sx={{
									width: windowSize.width / 2,
									height: windowSize.height / 2,
									overflow: "hidden",
									float: "left",
									outline: "1px solid black",
								}}
							>
								<LoadUrl url={getPageUrl(subpage)} height={windowSize.height} />
							</Box>
						))}
					</>
				)}
			</>
		);
	}
	return <ListDashboard setDashboard={setDashboard}></ListDashboard>;
}

export default DashboardPage;
