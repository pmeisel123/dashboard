import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TicketProps } from "./types";
import { getTicketsApi } from "./tickets";

const initialState: { [key: string]: TicketProps[] } = {
	"": [],
};

export const fetchTickets = createAsyncThunk(
	"tickets/fetchTickets",
	async (search: string) => {
		const data: TicketProps[] = await getTicketsApi(search);
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
				const searchKey = action.meta.arg;
				if (!state[searchKey]) {
					state[searchKey] = [];
				}
			})
			.addCase(fetchTickets.fulfilled, (state, action) => {
				const data = action.payload;
				const searchKey = action.meta.arg;
				state[searchKey] = data;
			});
	},
});

export default ticketsSlice.reducer;
