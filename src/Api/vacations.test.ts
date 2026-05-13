import { expect, test, vi } from "vitest";
import * as vacations from "./vacations";

// Mock global.fetch for vacation CSV reading
test("getVacationApi returns object with arrays when CSV present", async () => {
	const csv = "john@example.com,2026-12-25\njane@example.com,2026-01-01\n";
	const mockBody = {
		getReader: () => ({
			read: async () => ({ value: new TextEncoder().encode(csv) }),
		}),
	};
	(global as any).fetch = vi.fn().mockResolvedValue({ body: mockBody });

	const res = await vacations.getVacationApi();
	expect(res["john@example.com"]).toBeDefined();
	expect(Array.isArray(res["john@example.com"])).toBe(true);
});
