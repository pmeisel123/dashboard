import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { GitLatestReleaseSlice, LatestRelease } from "../Types";
import { getLatestRelease } from "./git";

const initialState: { [key: string]: GitLatestReleaseSlice } = {
	"": {
		release: null,
		loaded: null,
	},
};

export const fetchLatestRelease = createAsyncThunk("git/getLatestReleases", async (repo: string) => {
	const data: LatestRelease | null = await getLatestRelease(repo);
	return data;
});

export const gitLatestReleasesSlice = createSlice({
	name: "Releases",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchLatestRelease.pending, (state, action) => {
				const repo = action.meta.arg;
				if (!state[repo]) {
					state[repo] = {
						release: null,
						loaded: null,
					};
				}
			})
			.addCase(fetchLatestRelease.fulfilled, (state, action) => {
				const data = action.payload;
				const repo = action.meta.arg;
				state[repo] = {
					release: data,
					loaded: Date.now(),
				};
			});
	},
});

export default gitLatestReleasesSlice.reducer;
