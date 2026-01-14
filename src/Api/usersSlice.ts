import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { LoadedSlice, UsersGroupProps } from "./Types";
import { getUsersAndGroupsApi } from "./users";

const initialState: UsersGroupProps & LoadedSlice = {
	groups: [],
	users: {},
	loaded: null,
};

export const fetchUsersAndGroups = createAsyncThunk("users/fetchUsersAndGroups", async () => {
	const data: UsersGroupProps = await getUsersAndGroupsApi();
	return data;
});

export const usersGroupSlice = createSlice({
	name: "usersandgroups",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchUsersAndGroups.fulfilled, (state, action) => {
			state.users = action.payload.users;
			state.groups = action.payload.groups;
			state.loaded = Date.now();
		});
	},
});
export default usersGroupSlice.reducer;
