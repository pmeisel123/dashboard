import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ConfigProps, LoadedSlice, UsersGroupProps } from "./Types";
import { getUsersAndGroupsApi } from "./users";

const initialState: UsersGroupProps & LoadedSlice = {
	groups: [],
	users: {},
	loaded: null,
};

export const fetchUsersAndGroups = createAsyncThunk("users/fetchUsersAndGroups", async (config: ConfigProps) => {
	const data: UsersGroupProps = await getUsersAndGroupsApi(config);
	return data;
});

export const usersGroupSlice = createSlice({
	name: "usersandgroups",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchUsersAndGroups.fulfilled, (state, action) => {
			Object.assign(state, action.payload);
			state.loaded = Date.now();
		});
	},
});
export default usersGroupSlice.reducer;
