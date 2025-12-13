import { Box, Button } from "@mui/material";
import type { DashboardProps } from "@src/Api";
import type { Dispatch, FC, ReactNode, SetStateAction } from "react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { isExternalLink } from "./const";

declare const __DASHBOARDS__: { [key: string]: DashboardProps };

const ExternalLink: FC<{ to: string; children: ReactNode }> = ({ to, children, ...props }) => {
	if (isExternalLink(to)) {
		return (
			<a href={to} target="_blank" rel="noopener noreferrer" {...props}>
				{children}
			</a>
		);
	}
	return (
		<Link to={to} {...props}>
			{children}
		</Link>
	);
};
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
						sx={{
							textDecoration: "underline",
							"&:hover": {
								textDecoration: "underline",
							},
						}}
						onClick={() => {
							setDashboard(__DASHBOARDS__[key].key);
						}}
					>
						{__DASHBOARDS__[key].name}
					</Button>
					<Box>
						{__DASHBOARDS__[key].pages.map((page, index) => (
							<Box
								sx={{
									paddingLeft: 5,
								}}
								key={index + page.name}
							>
								{"url" in page && <ExternalLink to={page.url}>{page.name}</ExternalLink>}
								{page && "split" in page && (
									<>
										{page.name}:
										{page.pages.map((subpage, subindex) => (
											<Box
												sx={{
													paddingLeft: 5,
												}}
												key={index + " " + subindex + subpage.name}
											>
												<ExternalLink to={subpage.url}>{subpage.name}</ExternalLink>
											</Box>
										))}
									</>
								)}
							</Box>
						))}
					</Box>
				</Fragment>
			))}
		</>
	);
};

export default ListDashboard;
