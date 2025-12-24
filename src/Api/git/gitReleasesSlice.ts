import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { GitRelease, GitReleaseSlice } from "../Types";
import { getReleases } from "./git";

const initialState: { [key: string]: GitReleaseSlice } = {
	"": {
		releases: [],
		loaded: null,
	},
};

export const fetchReleases = createAsyncThunk("git/getReleases", async (repo: string) => {
	const data: GitRelease[] = await getReleases(repo);
	return data;
});

export const gitReleasesSlice = createSlice({
	name: "Releases",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchReleases.pending, (state, action) => {
				const repo = action.meta.arg;
				if (!state[repo]) {
					state[repo] = {
						releases: [],
						loaded: null,
					};
				}
			})
			.addCase(fetchReleases.fulfilled, (state, action) => {
				const data = action.payload;
				const repo = action.meta.arg;
				state[repo] = {
					releases: data,
					loaded: Date.now(),
				};
			});
	},
});

export const isGitReleasesRecent = (gitSlice: GitReleaseSlice) => {
	// The git api does a lot of sub api calls
	// This is allows it to cache for 10 minutes
	const TEN_MINUTES_MS = 1000 * 60 * 10;
	return gitSlice.loaded && gitSlice.loaded > Date.now() - TEN_MINUTES_MS;
};

export default gitReleasesSlice.reducer;
