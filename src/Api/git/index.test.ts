import { expect, test } from "vitest";
import * as gitIndex from "./index";

test("git/index exports", () => {
	expect(typeof gitIndex).toBe("object");
});
