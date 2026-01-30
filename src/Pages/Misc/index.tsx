import type { RoutePageProps } from "@src/Api";
import { DatePage } from "./date";
import { NextHolidayPage } from "./next_holiday";
import { TextPage } from "./text";
import { TimePage } from "./time";

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/Time",
		name: "Time",
		element: <TimePage />,
		description: <>Time (for dashboards)</>,
		requires: "false",
	},
	{
		path: "/Date",
		name: "Date",
		element: <DatePage />,
		description: <>Date (for dashboards)</>,
		requires: "false",
	},
	{
		path: "/NextHoliday",
		name: "Next Holiday",
		element: <NextHolidayPage />,
		description: <>Next holiday coming up (for dashboards)</>,
		requires: "false",
	},
	{
		path: "/Text",
		name: "Text",
		element: <TextPage />,
		description: <>Show some text on the page (for dashboards)</>,
		requires: "false",
	},
];
