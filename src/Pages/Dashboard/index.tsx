import { Box, Button } from "@mui/material";
import type { DashboardProps } from "@src/Api";
import type { Dispatch, FC, SetStateAction, lazy } from "react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

declare const __DASHBOARDS__: { [key: string]: DashboardProps };

const ListDashboard: FC<{
	setDashboard: Dispatch<SetStateAction<string>>;
}> = ({ setDashboard }) => {
	return (
		<>
			{Object.keys(__DASHBOARDS__).map((key) => (
				<>
					<Button
						onClick={() => {
							setDashboard(__DASHBOARDS__[key].key);
						}}
					>
						{__DASHBOARDS__[key].name}
					</Button>
					<Box>
						{__DASHBOARDS__[key].pages.map((page) => (
							<Box sx={{ paddingLeft: 5 }}>
								<Link to={page.url}>{page.name}</Link>
							</Box>
						))}
					</Box>
				</>
			))}
		</>
	);
};


function DashboardPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [dashboard, setDashboard] = useState<string>(
		searchParams.get("dashboard") || "",
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
	if (dashboard && __DASHBOARDS__[dashboard]) {
		let url = __DASHBOARDS__[dashboard].pages[0].url;
		if (url.match(/\?/)) {
			url += '&';
		} else {
			url += '?';
		}
		url += "isDashboard=true";
		return <>
			<iframe
				width="100%"
				height="100%"
				src={url}
				frameBorder="0"
				allowFullScreen="true"
				allow="fullscreen"
			/>
		</>;
	}
	return <ListDashboard setDashboard={setDashboard}></ListDashboard>;
}

export default DashboardPage;
