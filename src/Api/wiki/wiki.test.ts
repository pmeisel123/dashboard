import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as wiki from "./wiki";

beforeEach(() => {
	vi.restoreAllMocks();
});

afterEach(() => {
	delete (global as any).fetch;
});

describe("wiki API", () => {
	test("getWikiApi returns title and body when found", async () => {
		const mock = { title: "Page Title", body: { view: { value: "<p>content</p>" } } };
		(global as any).fetch = vi.fn().mockResolvedValue({ json: async () => mock });

		const res = await wiki.getWikiApi("123");
		expect(res.title).toBe("Page Title");
		expect(res.body).toBe("<p>content</p>");
	});

	test("getWikiApi returns Not found when no body", async () => {
		(global as any).fetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
		const res = await wiki.getWikiApi("nope");
		expect(res.title).toBe("");
		expect(res.body).toBe("Not found");
	});

	test("getWikiSpaces aggregates paginated results", async () => {
		// first page has results and a _links.next
		const page1 = {
			results: [{ key: "SPACE1", name: "Space One" }],
			_links: { next: "/rest/api/space?start=1" },
		};
		// second page has results and no next
		const page2 = {
			results: [{ key: "SPACE2", name: "Space Two" }],
		};

		(global as any).fetch = vi.fn((url: string) => {
			// If the URL is the paginated next link (includes start=1), return page2
			if (url.includes("start=1")) {
				return Promise.resolve({ json: async () => page2 });
			}
			if (url.includes("/jirawiki/rest/api/space")) {
				return Promise.resolve({ json: async () => page1 });
			}
			if (url.includes("/rest/api/space")) {
				return Promise.resolve({ json: async () => page2 });
			}
			return Promise.resolve({ json: async () => ({}) });
		});

		const res = await wiki.getWikiSpaces();
		expect(res).toEqual([
			{ key: "SPACE1", name: "Space One" },
			{ key: "SPACE2", name: "Space Two" },
		]);
	});

	test("getWikiPages returns empty array when spaceKey is empty", async () => {
		const res = await wiki.getWikiPages("");
		expect(res).toEqual([]);
	});

	test("getWikiPages returns pages list for a space", async () => {
		const mockResp = {
			page: {
				results: [
					{ id: "1", title: "P1" },
					{ id: "2", title: "P2" },
				],
			},
		};
		(global as any).fetch = vi.fn().mockResolvedValue({ json: async () => mockResp });

		const res = await wiki.getWikiPages("SPACE1");
		expect(res).toEqual([
			{ id: "1", title: "P1" },
			{ id: "2", title: "P2" },
		]);
	});
});
