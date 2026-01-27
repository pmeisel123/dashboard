import { DatePage } from "./date";
import { NextHolidayPage } from "./next_holiday";
import { TextPage } from "./text";
import { TimePage } from "./time";

export const GetModulePages = () => [
	{
		path: "/time",
		name: "Time",
		element: <TimePage />,
		description: <>Time (for dashboards)</>,
		requires: "false",
	},
	{
		path: "/date",
		name: "Date",
		element: <DatePage />,
		description: <>Date (for dashboards)</>,
		requires: "false",
	},
	{
		path: "/nextholiday",
		name: "Next Holiday",
		element: <NextHolidayPage />,
		description: <>Next holiday coming up (for dashboards)</>,
		requires: "false",
	},
	{
		path: "/text",
		name: "Text",
		element: <TextPage />,
		description: <>Show some text on the page (for dashboards)</>,
		requires: "false",
	},
];
