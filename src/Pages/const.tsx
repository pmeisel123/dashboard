import HomePage from '@src/Pages/Home';
import EstimatorPage from '@src/Pages/Estimator';
import WhoIsOutPage from '@src/Pages/WhoIsOut';
import HolidayPage from '@src/Pages/Holiday';
import MyTicketsPage from '@src/Pages/MyTickets';
import RecentTicketsPage from '@src/Pages/RecentTickets';
export const pages = [
	{
		path: '/',
		name: 'Home',
		element: <HomePage />,
		description: (<>Landing Page</>),
	},
	{
		path: '/Estimator',
		name: 'Estimator',
		element: <EstimatorPage />,
		description: (
			<>
				Display Jira tickets, user their estimate, and select users to get the approximat date of when they all will be completed<br />
				Will use upcoming vacation time and holidays in the estimates<br />
				Useful for project planning
			</>
		),
	},
	{
		path: '/MyTickets',
		name: 'My Tickets',
		element: <MyTicketsPage />,
		description: (
			<>
				Find a ticket by a user.<br />
				Selected user will be saved to localstorage
			</>
		),
	},
	{
		path: '/RecentTickets',
		name: 'Recent Tickets',
		element: <RecentTicketsPage />,
		description: (
			<>
				Find Tickets recently files
			</>
		),
	},
	{
		path: '/holidays',
		element: <HolidayPage />,
		name: 'Holidays',
		description: (
			<>
				Show holidays by year.  By default filtered for US bank holidays.<br />
				To Change Edit src/API/holiday.ts getHolidays
			</>
		),
	},
	{
		path: '/whoisout',
		name: 'Who is out',
		element: <WhoIsOutPage />,
		description: (
			<>
				Show upcoming vacation<br />
				Users are pulled from Jira<br />
				Vacation times are pulled from src/assets/vacation.csv via src/API/vacations.tsx<br />
				Need to pull vacations from your HR site.  Either via a cron job updating the csv file or by
				updating to vacations api to automaticlly pull/format the vacation data
			</>
		),
	},
];
