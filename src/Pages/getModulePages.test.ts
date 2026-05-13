import { describe, expect, it } from "vitest";

import { GetModulePages as BranchesPages } from "./Branches/index";
import { GetModulePages as DashboardPages } from "./Dashboard/index";
import { GetModulePages as DucksPages } from "./Ducks/index";
import { GetModulePages as EditConfigPages } from "./EditConfig/index";
import { GetModulePages as EstimatorPages } from "./Estimator/index";
import { GetModulePages as HolidayPages } from "./Holiday/index";
import { GetModulePages as HomePages } from "./Home/index";
import { GetModulePages as MiscPages } from "./Misc/index";
import { GetModulePages as MyTicketsPages } from "./MyTickets/index";
import { GetModulePages as RecentTicketsPages } from "./RecentTickets/index";
import { GetModulePages as SortListPages } from "./SortList/index";
import { GetModulePages as VacationsPages } from "./Vacations/index";
import { GetModulePages as WhoIsOutPages } from "./WhoIsOut/index";
import { GetModulePages as WikiPages } from "./Wiki/index";

const modules = {
	WikiPages,
	WhoIsOutPages,
	VacationsPages,
	SortListPages,
	RecentTicketsPages,
	MyTicketsPages,
	MiscPages,
	HolidayPages,
	EstimatorPages,
	EditConfigPages,
	DashboardPages,
	BranchesPages,
	DucksPages,
	HomePages,
};

describe("Module GetModulePages exports", () => {
	Object.entries(modules).forEach(([name, fn]) => {
		it(`${name} should export GetModulePages that returns an array of routes`, () => {
			const res = fn();
			expect(Array.isArray(res)).toBe(true);
			if (res.length > 0) {
				const item = res[0];
				expect(item).toHaveProperty("path");
				expect(item).toHaveProperty("name");
				expect(item).toHaveProperty("element");
			}
		});
	});
});
