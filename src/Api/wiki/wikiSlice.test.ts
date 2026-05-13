import { expect, test } from "vitest";
import reducer from "./wikiSlice";

test("wikiSlice reducer - initial state", () => {
	const state = reducer(undefined as any, { type: "@@INIT" } as any);
	expect(state).toBeDefined();
});
