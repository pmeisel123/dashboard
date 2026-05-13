import { expect, test } from "vitest";
import reducer from "./configSlice";

test("configSlice has a reducer function", () => {
	const state = reducer(undefined as any, { type: "@@INIT" } as any);
	expect(state).toBeDefined();
});
