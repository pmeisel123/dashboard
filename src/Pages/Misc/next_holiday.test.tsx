import { describe, expect, it } from "vitest";

describe("src/Pages/Misc/next_holiday.tsx", () => {
	it("imports without throwing and exports something", async () => {
		const mod = await import("./next_holiday");
		expect(mod).toBeTruthy();
		expect(Object.keys(mod).length).toBeGreaterThan(0);
	}, 20000);
});
