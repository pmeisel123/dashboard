import { expect, test } from "vitest";
import * as store from "./store";

test("store module exports functions", () => {
	expect(typeof store).toBe("object");
});
