import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { BranchesAndTicket, ConfigProps, LoadedSlice } from "../Types";
import { getBranches } from "./git";

const initialState: BranchesAndTicket & LoadedSlice = {
	branches: {},
	tickets: {},
	loaded: null,
};

export const fetchBranches = createAsyncThunk("git/getBranches", async (config: ConfigProps) => {
	const data: BranchesAndTicket = await getBranches(config);
	return data;
});

export const gitBranchSlice = createSlice({
	name: "branches",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchBranches.fulfilled, (state, action) => {
			Object.assign(state, action.payload);
			state.loaded = Date.now();
		});
	},
});

export default gitBranchSlice.reducer;
