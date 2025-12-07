import type { CustomFieldsProps, DashboardProps } from './src/Api/types';

// https://id.atlassian.com/manage-profile/security/api-tokens
export const API_KEY = ''; // Jira API Key
export const API_URL = ''; // like https://pmeisel.atlassian.net/';
export const API_USERNAME = ''; // Email address used to create the jira api key
export const VACATION_KEY: ('email' | 'name') = 'email';
export const DONE_STATUS = ['Done'];
export const CUSTOM_FIELDS: {[key: string]: CustomFieldsProps} ={}; // Custom fields for Jira Ticket
/* Like This
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
};
*/
export const DASHBOARD_SPEED_SECONDS = 10;
export const DASHBOARDS: {[key: string]: DashboardProps} ={
	'dev': {
		'key': 'dev',
		'name': "Dev Dashboard",
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
				name: "Holidays",
				url: "/holidays"
			},
		]
	},
	'company': {
			'key': 'company',
			'name': "Company Dashboard",
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
		}
}
export const DASHBOARD_DUCKS = true; // Leave as true (or set to false turn off the ducks on the dashboard, but where is the fun in that?)
