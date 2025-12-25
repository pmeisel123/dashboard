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

export default gitReleasesSlice.reducer;
