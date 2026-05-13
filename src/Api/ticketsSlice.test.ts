import { expect, test } from "vitest";
import reducer from "./ticketsSlice";

test("ticketsSlice reducer - initial state", () => {
	const state = reducer(undefined as any, { type: "@@INIT" } as any);
	expect(state).toBeDefined();
});
