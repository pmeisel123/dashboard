import { Box, Button } from "@mui/material";
import type { DashboardProps } from "@src/Api";
import type { Dispatch, FC, SetStateAction } from "react";
import { Fragment, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

interface myHTMLIFrameElement extends HTMLIFrameElement {
	contentWindow: myContentWindow;
}

interface myContentWindow extends Window {
	changeUrl?: Function;
}

declare const __DASHBOARDS__: { [key: string]: DashboardProps };
declare const __DASHBOARD_SPEED_SECONDS__: number;

const ListDashboard: FC<{
	setDashboard: Dispatch<SetStateAction<string>>;
}> = ({ setDashboard }) => {
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
							<Box sx={{ paddingLeft: 5 }} key={key + page.name}>
								<Link to={page.url}>{page.name}</Link>
							</Box>
						))}
					</Box>
				</Fragment>
			))}
		</>
	);
};

function DashboardPage() {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	const [searchParams, setSearchParams] = useSearchParams();
	const [dashboard, setDashboard] = useState<string>(
		searchParams.get("dashboard") || "",
	);
	const [pageNumber, setPageNumber] = useState<number>(
		parseInt(searchParams.get("pageNumber") || "0"),
	);
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
	}, []);
	const ChangeUrl = (url: string) => {
		const iframe = document.getElementById(
			"dashboard",
		) as myHTMLIFrameElement | null;
		if (iframe && iframe.contentWindow && iframe.contentWindow.changeUrl) {
			iframe.contentWindow.changeUrl(url);
		} else {
			// TODO: fix this
			console.log("external url?", url);
		}
	};
	useEffect(() => {
		if (dashboard && __DASHBOARDS__[dashboard]) {
			let url = __DASHBOARDS__[dashboard].pages[pageNumber].url;
			if (url.match(/\?/)) {
				url += "&";
			} else {
				url += "?";
			}
			url += "isDashboard=true";
			ChangeUrl(url);
		}
	}, [pageNumber]);
	if (dashboard && __DASHBOARDS__[dashboard]) {
		let url = __DASHBOARDS__[dashboard].pages[0].url;
		if (url.match(/\?/)) {
			url += "&";
		} else {
			url += "?";
		}
		url += "isDashboard=true";
		return (
			<>
				<Box>
					<Button
						sx={{
							float: "right",
							outline: "1px solid red",
							marginBottom: "2px",
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
						(Page {pageNumber + 1} of{" "}
						{__DASHBOARDS__[dashboard].pages.length})
					</>
					<Box sx={{ clear: "both" }} />
				</Box>
				<iframe
					id="dashboard"
					style={{
						position: "fixed",
						top: "40px",
						left: 0,
						width: windowSize.width,
						height: windowSize.height - 40,
						border: "none",
						zIndex: 9999,
					}}
					src={url}
					frameBorder="0"
					allow="fullscreen"
				/>
			</>
		);
	}
	return <ListDashboard setDashboard={setDashboard}></ListDashboard>;
}

export default DashboardPage;
