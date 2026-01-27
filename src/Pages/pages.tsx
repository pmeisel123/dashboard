import { getDynamicPages } from "./pageRegistry";

export const pages = [
	...getDynamicPages(),
	{
		path: "/blank",
		name: "Blank",
		element: <></>,
		description: <>A blank Page</>,
		requires: "false",
	},
];
