// import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { WikiSpaceProps } from "./Types";
import { getWikiSpaces } from "./wiki";

const initialState: WikiSpaceProps[] = [];

export const fetchWikiSpaces = createAsyncThunk("wiki/fetchWikiSpaces", async () => {
	const data: WikiSpaceProps[] = await getWikiSpaces();
	return data;
});

export const wikiSpacesSlice = createSlice({
	name: "wikiSpaces",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchWikiSpaces.fulfilled, (state, action) => {
			const data = action.payload;
			if (data) {
				state.length = 0;
				state.push(...data);
			}
		});
	},
});

export default wikiSpacesSlice.reducer;
