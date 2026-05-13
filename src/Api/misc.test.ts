import { expect, test } from "vitest";
import * as misc from "./misc";

test("misc module exports", () => {
	expect(typeof misc).toBe("object");
});
