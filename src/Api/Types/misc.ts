interface DashboardSinglePageProps {
	name: string;
	url: string;
}

type twoPages = [DashboardSinglePageProps, DashboardSinglePageProps];
type fourPages = [
	DashboardSinglePageProps,
	DashboardSinglePageProps,
	DashboardSinglePageProps,
	DashboardSinglePageProps,
];

interface DashboardPageSplitSidewaysProps {
	name: string;
	split: "sideways";
	pages: twoPages;
}

interface DashboardPageSplitUpDownProps {
	name: string;
	split: "updown";
	pages: twoPages;
}

interface DashboardPageSplitFourWaysProps {
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
