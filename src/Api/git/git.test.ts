import { expect, test } from "vitest";
import * as git from "./git";

test("git module exports", () => {
	expect(typeof git).toBe("object");
});
