import { describe, expect, it } from "vitest";

describe("src/Pages/Holiday/const.tsx", () => {
	it("imports without throwing and exports something", async () => {
		const mod = await import("./const");
		expect(mod).toBeTruthy();
		expect(Object.keys(mod).length).toBeGreaterThan(0);
	}, 20000);
});
