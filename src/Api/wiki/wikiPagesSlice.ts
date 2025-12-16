import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { WikiPagesProps } from "../Types";
import { getWikiPages } from "./wiki";

const initialState: { [key: string]: WikiPagesProps[] } = {
	"": [],
};

export const fetchWikiPages = createAsyncThunk("wiki/fetchWikiPages", async (spaceKey: string) => {
	const data: WikiPagesProps[] = await getWikiPages(spaceKey);
	return data;
});

export const wikiPagesSlice = createSlice({
	name: "wikiPages",
	initialState,
	reducers: {
		clearWikiSearch: (state, action: PayloadAction<string>) => {
			const spaceKey = action.payload;
			delete state[spaceKey];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchWikiPages.pending, (state, action) => {
				const spaceKey = action.meta.arg;
				if (!state[spaceKey]) {
					state[spaceKey] = [];
				}
			})
			.addCase(fetchWikiPages.fulfilled, (state, action) => {
				const data = action.payload;
				const spaceKey = action.meta.arg;
				state[spaceKey] = data;
			});
	},
});

export default wikiPagesSlice.reducer;
