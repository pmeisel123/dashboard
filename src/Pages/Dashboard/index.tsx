import { Box, Button } from "@mui/material";
import type { DashboardProps } from "@src/Api";
import { DashboardIframe, DashboardLoadPageWrapper, DashboardProgress, ListDashboard } from "@src/Components";
import { pages } from "@src/Pages/const";
import type { FC } from "react";
import { cloneElement, useEffect, useState } from "react";
import { Link, matchRoutes, useSearchParams } from "react-router-dom";

declare const __DASHBOARDS__: { [key: string]: DashboardProps };
declare const __DASHBOARD_SPEED_SECONDS__: number;

const LoadPage: FC<{
	url: string;
}> = ({ url }) => {
	if (url.match(/blank/)) {
		return null;
	}
	const urlObj = new URL(url, "http://random.com");
	const matches = matchRoutes(pages, {
		pathname: urlObj.pathname,
	});
	const lastMatch = matches ? matches[matches.length - 1] : null;
	if (!lastMatch || !lastMatch.route.element) {
		console.log("Bad url" + url);
		return null;
	}
	const params = new URLSearchParams(urlObj.searchParams);
	return cloneElement(lastMatch.route.element, {
		searchParamsOveride: params,
	});
};

function DashboardPage() {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	const [searchParams, setSearchParams] = useSearchParams();
	const [dashboard, setDashboard] = useState<string>(searchParams.get("dashboard") || "");
	const [pageNumber, setPageNumber] = useState<number>(parseInt(searchParams.get("pageNumber") || "0"));
	const [url, setUrl] = useState<string>("/blank?isDashboard=true");
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
	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);

		const changePageNumber = setInterval(() => {
			if (dashboard && __DASHBOARDS__[dashboard]) {
				setPageNumber((pageNumber) => {
					if (pageNumber + 1 >= pages_count) {
						return 0;
					} else {
						return pageNumber + 1;
					}
				});
			}
		}, __DASHBOARD_SPEED_SECONDS__ * 1000);
		return () => {
			window.removeEventListener("resize", handleResize);
			clearInterval(changePageNumber);
		};
	}, [dashboard]);

	const ChangeUrlFromPageNumber = () => {
		if (dashboard && __DASHBOARDS__[dashboard]) {
			let url = __DASHBOARDS__[dashboard].pages[pageNumber].url;
			if (url.match(/\?/)) {
				url += "&";
			} else {
				url += "?";
			}
			url += "isDashboard=true";
			setUrl(url);
		}
	};

	useEffect(() => {
		ChangeUrlFromPageNumber();
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
						to={__DASHBOARDS__[dashboard].pages[pageNumber].url}
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
				<DashboardProgress />
				{url.match(/^http/) && (
					<DashboardIframe
						id="dashboardexternal"
						src={url}
						allow="fullscreen"
						height={windowSize.height - 62}
					/>
				)}
				{!url.match(/^http/) && (
					<DashboardLoadPageWrapper id="loadPage">
						<LoadPage url={url}></LoadPage>
					</DashboardLoadPageWrapper>
				)}
			</>
		);
	}
	return <ListDashboard setDashboard={setDashboard}></ListDashboard>;
}

export default DashboardPage;
