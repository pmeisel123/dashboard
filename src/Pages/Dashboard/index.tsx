import { Box, Button } from "@mui/material";
import type { DashboardProps } from "@src/Api";
import { DashboardIframe, DashboardLoadPageWrapper, DashboardProgress } from "@src/Components";
import { pages } from "@src/Pages/const";
import type { Dispatch, FC, SetStateAction } from "react";
import { cloneElement, Fragment, useEffect, useState } from "react";
import { Link, matchRoutes, useSearchParams } from "react-router-dom";

declare const __DASHBOARDS__: { [key: string]: DashboardProps };
declare const __DASHBOARD_SPEED_SECONDS__: number;

const ListDashboard: FC<{
	setDashboard: Dispatch<SetStateAction<string>>;
}> = ({ setDashboard }) => {
	if (Object.keys(__DASHBOARDS__).length == 0) {
		return (
			<>
				Need to configure a dashboard in globals.ts Example:
				<pre>
					{`
export const DASHBOARDS: DashboardsProps = {
	dev: {
		key: 'dev',
		name: "Dev Dashboard",
		pages: [
			{
				name: "Recent Tickets 15 days",
				url: "/RecentTickets?days=15"
			},
			{
				name: "Dev off",
				url: "/whoisout?groups=Dev"
			},
			{
				name: "Recent Tickets 30 days",
				url: "/RecentTickets?days=30"
			},
			{
				name: "My Project",
				url: "/Estimator?defaultEstimate=6&estimatePadding=6&search=Summary+is+not+null"
			},
			{
				name: "Extended Holidays",
				url: "/holidays?withDucks=&extended=true"
			},
		]
	},
	company: {
		key: 'company',
		name: "Company Dashboard",
		pages: [
			{
				name: "Recent Tickets",
				url: "/RecentTickets?days=15"
			},
			{
				name: "Who is out",
				url: "/whoisout"
			},
			{
				name: "Holidays",
				url: "/holidays"
			},
		]
	},
};`}
				</pre>
			</>
		);
	}
	return (
		<>
			{Object.keys(__DASHBOARDS__).map((key) => (
				<Fragment key={key}>
					<Button
						onClick={() => {
							setDashboard(__DASHBOARDS__[key].key);
						}}
					>
						{__DASHBOARDS__[key].name}
					</Button>
					<Box>
						{__DASHBOARDS__[key].pages.map((page) => (
							<Box
								sx={{
									paddingLeft: 5,
								}}
								key={key + page.name}
							>
								<Link to={page.url}>{page.name}</Link>
							</Box>
						))}
					</Box>
				</Fragment>
			))}
		</>
	);
};

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
					<DashboardIframe id="dashboardexternal" src={url} allow="fullscreen" windowSize={windowSize} />
				)}
				{!url.match(/^http/) && (
					<DashboardLoadPageWrapper id="loadPage" windowSize={windowSize}>
						<LoadPage url={url}></LoadPage>
					</DashboardLoadPageWrapper>
				)}
			</>
		);
	}
	return <ListDashboard setDashboard={setDashboard}></ListDashboard>;
}

export default DashboardPage;
