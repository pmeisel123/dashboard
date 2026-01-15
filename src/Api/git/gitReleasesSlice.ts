import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ConfigProps, GitRelease, LoadedSlice } from "../Types";
import { getReleases } from "./git";

const initialState: { [key: string]: { releases: GitRelease[] } & LoadedSlice } = {
	"": {
		releases: [],
		loaded: null,
	},
};

export const fetchReleases = createAsyncThunk("git/getReleases", async ([repo, config]: [string, ConfigProps]) => {
	const data: GitRelease[] = await getReleases(repo, config);
	return data;
});

export const gitReleasesSlice = createSlice({
	name: "Releases",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchReleases.pending, (state, action) => {
				const repo = action.meta.arg[0];
				if (!state[repo]) {
					state[repo] = {
						releases: [],
						loaded: null,
					};
				}
			})
			.addCase(fetchReleases.fulfilled, (state, action) => {
				const data = action.payload;
				const repo = action.meta.arg[0];
				state[repo] = {
					releases: data,
					loaded: Date.now(),
				};
			});
	},
});

export default gitReleasesSlice.reducer;
