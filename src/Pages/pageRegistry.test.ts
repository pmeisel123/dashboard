import { describe, expect, it } from "vitest";

import { getDynamicPages, pageTestRequires } from "./pageRegistry";

describe("getDynamicPages in test env", () => {
	it("returns the static test pages array", () => {
		const pages = getDynamicPages();
		expect(Array.isArray(pages)).toBe(true);
		expect(pages.length).toBeGreaterThanOrEqual(1);
		// check a few known pages from the provided static array
		expect(pages.find((p) => p.path === "/Branches")).toBeDefined();
		expect(pages.find((p) => p.path === "/Wiki")).toBeDefined();
		expect(pages.find((p) => p.path === "/")).toBeDefined();
	});
});

describe("pageTestRequires helper", () => {
	const baseConfig: any = {
		API_URL: "https://api.example",
		ALLOW_VACATION_EDITS: true,
		API_CONFLUENCE_URL: "https://confluence.example",
		GIT_REPOS_PATHS: { repo1: "/path" },
	};

	it("handles falsy/false requirements", () => {
		expect(pageTestRequires("false", baseConfig)).toBe(false);
		expect(pageTestRequires("", baseConfig)).toBe(true);
		expect(pageTestRequires(null as any, baseConfig)).toBe(true);
	});

	it("checks APIURL requirement", () => {
		expect(pageTestRequires("APIURL", baseConfig)).toBe(true);
		expect(pageTestRequires("APIURL", { ...baseConfig, API_URL: "" })).toBe(false);
	});

	it("checks ALLOW_VACATION_EDITS requirement", () => {
		expect(pageTestRequires("ALLOW_VACATION_EDITS", baseConfig)).toBe(true);
		expect(pageTestRequires("ALLOW_VACATION_EDITS", { ...baseConfig, ALLOW_VACATION_EDITS: false })).toBe(false);
	});

	it("checks API_CONFLUENCE_URL requirement", () => {
		expect(pageTestRequires("API_CONFLUENCE_URL", baseConfig)).toBe(true);
		expect(pageTestRequires("API_CONFLUENCE_URL", { ...baseConfig, API_CONFLUENCE_URL: "" })).toBe(false);
	});

	it("checks GIT_REPOS_PATHS requirement", () => {
		expect(pageTestRequires("GIT_REPOS_PATHS", baseConfig)).toBe(true);
		expect(pageTestRequires("GIT_REPOS_PATHS", { ...baseConfig, GIT_REPOS_PATHS: {} })).toBe(false);
	});
});
