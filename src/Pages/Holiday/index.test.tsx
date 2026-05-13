import { describe, expect, it, vi } from "vitest";

// Mock heavy modules before importing the module under test to speed up import time.
// We mock API calls and Duck utilities which pull in larger dependencies.
vi.mock("@src/Api", () => ({
	getAllHolidays: (..._args: any[]) => [],
	getAllUsHolidays: (..._args: any[]) => [],
	getHolidays: (..._args: any[]) => [],
	getDate: (..._args: any[]) => new Date(Date.now()),
	getDateDistance: (..._args: any[]) => "",
	getDateStringWithDayOfWeek: (..._args: any[]) => "",
}));
vi.mock("@src/Components/Duck/const", () => ({
	cleanHolidayName: (s: string) => s,
	getHolidayDuck: (..._args: any[]) => ["", null],
}));
// Mock the local DateRow to a passthrough to avoid rendering overhead at import time
vi.mock("./const", () => ({
	DateRow: (props: any) => props.children,
}));

describe("src/Pages/Holiday/index.tsx", () => {
	it("imports without throwing and exports something", async () => {
		const mod = await import("./index");
		expect(mod).toBeTruthy();
		expect(Object.keys(mod).length).toBeGreaterThan(0);
	}, 20000);
});
