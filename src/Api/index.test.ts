import { expect, test } from "vitest";
import * as api from "./index";

test("index exports", () => {
	expect(typeof api).toBe("object");
});
