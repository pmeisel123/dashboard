import { describe, expect, it } from "vitest";

describe("src/Pages/EditConfig/customnav.tsx", () => {
	it("imports without throwing and exports something", async () => {
		const mod = await import("./customnav");
		expect(mod).toBeTruthy();
		expect(Object.keys(mod).length).toBeGreaterThan(0);
	}, 20000);
});
