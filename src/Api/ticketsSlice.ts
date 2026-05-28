import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getTicketsApi } from "./tickets";
import type { ConfigProps, TicketProps } from "./Types";

const initialState: { [key: string]: { [key: string]: TicketProps } } = {
	"": {},
};

export const fetchTickets = createAsyncThunk(
	"tickets/fetchTickets",
	async ([search, config]: [string, ConfigProps]) => {
		const data: { [key: string]: TicketProps } = await getTicketsApi(search, config);
		return data;
	},
);

export const ticketsSlice = createSlice({
	name: "tickets",
	initialState,
	reducers: {
		clearTicketsSearch: (state, action: PayloadAction<string>) => {
			const searchKey = action.payload;
			delete state[searchKey];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTickets.pending, (state, action) => {
				const searchKey = action.meta.arg[0];
				if (!state[searchKey]) {
					state[searchKey] = {};
				}
			})
			.addCase(fetchTickets.fulfilled, (state, action) => {
				const data = action.payload;
				const searchKey = action.meta.arg[0];
				state[searchKey] = data;
			});
	},
});

export default ticketsSlice.reducer;
