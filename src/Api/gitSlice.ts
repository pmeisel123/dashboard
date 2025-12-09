import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getBranches } from "./git";
import type { BranchesAndTicket } from "./Types";

const initialState: BranchesAndTicket = {
	branches: {},
	tickets: {},
	loaded: null,
};

export const fetchBranches = createAsyncThunk("git/getBranches", async () => {
	const data: BranchesAndTicket = await getBranches();
	return data;
});

export const gitBranchSlice = createSlice({
	name: "branches",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchBranches.fulfilled, (state, action: PayloadAction<BranchesAndTicket>) => {
			state.branches = action.payload.branches;
			state.tickets = action.payload.tickets;
			state.loaded = Date.now();
		});
	},
});

export const isGitDataRecent = (gitSlice: BranchesAndTicket) => {
	// The git api does a lot of sub api calls
	// This is allows it to cache for 10 minutes
	const TEN_MINUTES_MS = 1000 * 60 * 10;
	return gitSlice.loaded && gitSlice.loaded > Date.now() - TEN_MINUTES_MS;
};

export default gitBranchSlice.reducer;
