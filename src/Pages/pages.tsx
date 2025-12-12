import type { ReportNamePaths } from "@src/Api";
import BranchesPage from "@src/Pages/Branches";
import Dashboard from "@src/Pages/Dashboard";
import DucksPage from "@src/Pages/Ducks";
import EstimatorPage from "@src/Pages/Estimator";
import HolidayPage from "@src/Pages/Holiday";
import HomePage from "@src/Pages/Home";
import * as Misc from "@src/Pages/Misc";
import MyTicketsPage from "@src/Pages/MyTickets";
import RecentTicketsPage from "@src/Pages/RecentTickets";
import WhoIsOutPage from "@src/Pages/WhoIsOut";

declare const __GIT_REPOS_PATHS__: { [key: string]: ReportNamePaths };

export const pages = [
	{
		path: "/",
		name: "Home",
		element: <HomePage />,
		description: <>Landing Page for the application.</>,
	},
	{
		path: "/Estimator",
		name: "Estimator",
		element: <EstimatorPage />,
		description: (
			<>
				Calculate approximate project completion dates based on Jira ticket estimates, user selection, upcoming
				vacations, and holidays. Useful for project planning.
			</>
		),
	},
	{
		path: "/MyTickets",
		name: "My Tickets",
		element: <MyTicketsPage />,
		description: (
			<>View tickets assigned to a specific user. The selected user is saved to local storage for convenience.</>
		),
	},
	{
		path: "/RecentTickets",
		name: "Recent Tickets",
		element: <RecentTicketsPage />,
		description: <>Find tickets that were recently filed.</>,
	},
	{
		path: "/branches",
		name: "Branches",
		element: <BranchesPage />,
		description: <>List all the git repositories and their respective branches.</>,
		requires: !!Object.keys(__GIT_REPOS_PATHS__).length,
	},
	{
		path: "/holidays",
		element: <HolidayPage />,
		name: "Holidays",
		description: (
			<>
				Display US bank holidays by year. To change the default filters, edit src/API/holiday.ts &gt;
				getHolidays.
			</>
		),
	},
	{
		path: "/whoisout",
		name: "Who is out",
		element: <WhoIsOutPage />,
		description: (
			<>
				Show upcoming vacations. Users are pulled from Jira, and vacation times are sourced from
				src/assets/vacation.csv via src/API/vacations.tsx
				<br />
				Need to pull vacations from your HR site. Either via a cron job updating the csv file or by updating to
				vacations api to automaticlly pull/format the vacation data
			</>
		),
	},
	{
		path: "/dashboard",
		name: "Dashboard",
		element: <Dashboard />,
		description: (
			<>
				Dashboards are configured within the globals.ts file. When a dashboard is loaded, the page will
				automatically switch between different pages.
				<br />
				This is useful for displaying information on internal office screens.
			</>
		),
	},
	{
		path: "/ducks",
		name: "Ducks",
		element: <DucksPage />,
		description: <>DUCKS!</>,
		requires: false,
	},
	{
		path: "/blank",
		name: "Blank",
		element: <></>,
		description: <></>,
		requires: false,
	},
	{
		path: "/time",
		name: "Time",
		element: <Misc.TimePage />,
		description: <>Time</>,
		requires: false,
	},
	{
		path: "/date",
		name: "Date",
		element: <Misc.DatePage />,
		description: <>Date</>,
		requires: false,
	},
	{
		path: "/nextholiday",
		name: "Next Holiday",
		element: <Misc.NextHolidayPage />,
		description: <>Next holiday coming up</>,
		requires: false,
	},
	{
		path: "/text",
		name: "Text",
		element: <Misc.TextPage />,
		description: <>Show some teext on the page</>,
		requires: false,
	},
];
