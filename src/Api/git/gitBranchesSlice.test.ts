import { expect, test } from "vitest";
import reducer from "./gitBranchesSlice";

test("gitBranchesSlice reducer exists", () => {
	const state = reducer(undefined as any, { type: "@@INIT" } as any);
	expect(state).toBeDefined();
});
