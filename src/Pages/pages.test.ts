import { describe, expect, it } from "vitest";
import { pages } from "./pages";

describe("pages export", () => {
	it("exports a sorted array of pages", () => {
		expect(Array.isArray(pages)).toBe(true);
		expect(pages.length).toBeGreaterThanOrEqual(1);

		// Ensure sorted by name safely handling types
		for (let i = 1; i < pages.length; i++) {
			const prevName = (pages[i - 1] as any).name || "";
			const currentName = (pages[i] as any).name || "";
			expect(prevName.localeCompare(currentName)).toBeLessThanOrEqual(0);
		}
	});

	it("contains expected routes from test pages", () => {
		// Explicitly type parameter 'p' as any to eliminate implicit any check failures
		expect(pages.some((p: any) => p.path === "/Branches")).toBe(true);
		expect(pages.some((p: any) => p.path === "/Wiki")).toBe(true);
		expect(pages.some((p: any) => p.path === "/")).toBe(true);
	});
});
