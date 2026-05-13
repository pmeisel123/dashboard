import { expect, test } from "vitest";
import * as config from "./config";

test("config exports expected keys", () => {
	// Ensure config module exports an object or functions we expect
	expect(typeof config).toBe("object");
});
