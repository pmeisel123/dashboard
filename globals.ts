import type { CustomFieldsObjectProps, DashboardsProps, ReposProps } from './src/Api/Types';

// Domain you are running this dashboard on
export const HOST = "www.cybersquad.net";
export const PORT = 3000;

// Jira Settings
// https://id.atlassian.com/manage-profile/security/api-tokens
export const API_KEY = ''; // API Key for Jira
export const API_URL = ''; // Host of jira Example: https://pmeisel.atlassian.net/
export const API_USERNAME = ''; // Email address used to create the jira api key
export const VACATION_KEY: ('email' | 'name') = 'email';
export const DONE_STATUS = ['Done'];
export const CUSTOM_FIELDS: CustomFieldsObjectProps = {}; // Custom fields for Jira Ticket
/* Example
{
	'customfield_10001': {
		'Name': 'Team',
		'Type': 'Text'
	},
	'customfield_10058': {
		'Name': 'Code Review',
		'Type': 'Link',
		'LinkIcon': 'Grading',
	},
	'customfield_10091': {
		'Name': 'Reviewer',
		'Type': 'User',
	},
};
*/

// Git Settings
// https://github.com/settings/personal-access-tokens
// Grant read access to Commit Status, Contents, Metadata, pull requests
export const GITTOKEN = ''; // Starts with github_
export const GITREPOS: ReposProps[] = [];
/* Example
	{
		name: 'Dashboard',
		url: 'https://github.com/pmeisel123/dashboard/'
	}
];
*/
// Dashboards Settings
export const DASHBOARD_SPEED_SECONDS = 10;
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
};
export const DASHBOARD_DUCKS = true; // Leave as true (or set to false turn off the ducks on the dashboard, but where is the fun in that?)
