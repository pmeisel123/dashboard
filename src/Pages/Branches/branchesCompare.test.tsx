import { describe, expect, it } from "vitest";

describe("src/Pages/Branches/branchesCompare.tsx", () => {
	it("imports without throwing and exports something", async () => {
		const mod = await import("./branchesCompare");
		expect(mod).toBeTruthy();
		expect(Object.keys(mod).length).toBeGreaterThan(0);
	}, 20000);
});
