import { expect, test } from "vitest";
import { getHolidayDayString } from "./holiday";

test("getHolidayDayString returns yyyy-mm-dd", () => {
	const date = new Date("2026-12-25T00:00:00Z");
	const s = getHolidayDayString(date);
	expect(typeof s).toBe("string");
	expect(s).toMatch(/\d{4}-\d{2}-\d{2}/);
});
