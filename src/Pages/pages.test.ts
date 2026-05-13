import { describe, expect, it } from "vitest";
import { getPages } from "./pages";

const pages = getPages();
describe("pages export", () => {
	it("exports a sorted array of pages", () => {
		expect(Array.isArray(pages)).toBe(true);
		expect(pages.length).toBeGreaterThanOrEqual(1);
		// ensure sorted by name
		for (let i = 1; i < pages.length; i++) {
			expect(pages[i - 1].name.localeCompare(pages[i].name)).toBeLessThanOrEqual(0);
		}
	});

	it("contains expected routes from test pages", () => {
		expect(pages.some((p) => p.path === "/Branches")).toBe(true);
		expect(pages.some((p) => p.path === "/Wiki")).toBe(true);
		expect(pages.some((p) => p.path === "/")).toBe(true);
	});
});
