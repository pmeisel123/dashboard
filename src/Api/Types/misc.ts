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
