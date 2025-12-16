import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { WikiPageProps } from "../Types";
import { getWikiApi } from "./wiki";

const initialState: { [key: string]: WikiPageProps } = {
	"": {
		title: "",
		body: "",
	},
};

export const fetchWiki = createAsyncThunk("wiki/fetchWiki", async (search: string) => {
	const data: WikiPageProps = await getWikiApi(search);
	return data;
});

export const wikiSlice = createSlice({
	name: "wiki",
	initialState,
	reducers: {
		clearWikiSearch: (state, action: PayloadAction<string>) => {
			const wikiKey = action.payload;
			delete state[wikiKey];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchWiki.pending, (state, action) => {
				const wikiKey = action.meta.arg;
				if (!state[wikiKey]) {
					state[wikiKey] = {
						title: "",
						body: "",
					};
				}
			})
			.addCase(fetchWiki.fulfilled, (state, action) => {
				const data = action.payload;
				const wikiKey = action.meta.arg;
				state[wikiKey] = data;
			});
	},
});

export default wikiSlice.reducer;
