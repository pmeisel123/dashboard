import { getDynamicPages } from "./pageRegistry";

export const pages = [
	...getDynamicPages(),
].sort((a, b) => a.name.localeCompare(b.name));
