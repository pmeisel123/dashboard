import type { ReactNode } from "react";
import type { RepoNamePaths, ReposProps } from "./gittypes";
import type { CustomFieldsObjectProps } from "./ticketstypes";

export interface DashboardSinglePageProps {
	name: string;
	url: string;
}

export type twoPages = [DashboardSinglePageProps, DashboardSinglePageProps];
export type fourPages = [
	DashboardSinglePageProps,
	DashboardSinglePageProps,
	DashboardSinglePageProps,
	DashboardSinglePageProps,
];

export interface DashboardPageSplitSidewaysProps {
	name: string;
	split: "sideways";
	pages: twoPages;
}

export interface DashboardPageSplitUpDownProps {
	name: string;
	split: "updown";
	pages: twoPages;
}

export interface DashboardPageSplitFourWaysProps {
	name: string;
	split: "fourways";
	pages: fourPages;
}

export type DashboardPageProps =
	| DashboardSinglePageProps
	| DashboardPageSplitSidewaysProps
	| DashboardPageSplitUpDownProps
	| DashboardPageSplitFourWaysProps;

export interface DashboardProps {
	key: string;
	name: string;
	pages: DashboardPageProps[];
}

export interface DashboardsProps {
	[key: string]: DashboardProps;
}

export interface HolidayProps {
	name: string;
	date: string;
	type: string;
	bank?: boolean;
}

export type VacationKeyType = "email" | "name";

export interface EditableRow {
	key: string;
}

export interface CustomNavLinks {
	url: string;
	sort: number;
}

export interface ConfigProps {
	ALLOW_VACATION_EDITS: boolean;
	API_CONFLUENCE_URL: string;
	API_KEY_DEFINED: boolean;
	API_URL: string;
	CUSTOM_FIELDS: CustomFieldsObjectProps;
	DASHBOARDS: DashboardsProps;
	DASHBOARD_DUCKS: boolean;
	DASHBOARD_SPEED_SECONDS: number;
	DONE_STATUS: string[];
	GITTOKEN_DEFINED: boolean;
	HOST: string;
	PORT: number;
	USE_SSL: boolean;
	VACATION_KEY: VacationKeyType;
	GIT_REPOS_PATHS: { [key: string]: RepoNamePaths };
	ALLOW_CONFIG_EDIT: boolean;
	ALLOW_DASHBOARD_EDIT: boolean;
	DUCKS: string[];
	CUSTOM_NAV_LINKS?: { [key: string]: CustomNavLinks };
	GEMINI_API_KEY_DEFINED: boolean;
	SLACK_TOKEN_KEYS: string[];
}

export interface ConfigPropsFile {
	ALLOW_VACATION_EDITS: boolean;
	ALLOW_CONFIG_EDIT: boolean;
	ALLOW_DASHBOARD_EDIT: boolean;
	API_CONFLUENCE_URL: string;
	API_KEY: string;
	API_URL: string;
	API_USERNAME: string;
	CUSTOM_FIELDS: CustomFieldsObjectProps;
	DASHBOARDS: DashboardsProps;
	DASHBOARD_DUCKS: boolean;
	DASHBOARD_SPEED_SECONDS: number;
	DONE_STATUS: string[];
	GITTOKEN: string;
	HOST: string;
	PORT: number;
	USE_SSL: boolean;
	VACATION_KEY: VacationKeyType;
	GITREPOS: ReposProps[];
	CUSTOM_NAV_LINKS?: { [key: string]: CustomNavLinks };
	GEMINI_API_KEYS: string[];
	SLACK_TOKENS: { [key: string]: string };
}

export interface LoadedSlice {
	loaded: number | null; // ms since epoch
}

export interface RoutePageProps {
	path: string;
	name: string;
	element: ReactNode;
	description: ReactNode;
	requires?: "false" | "APIURL" | "ALLOW_VACATION_EDITS" | "API_CONFLUENCE_URL" | "GIT_REPOS_PATHS";
}
