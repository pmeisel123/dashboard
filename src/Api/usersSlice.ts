import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { UsersGroupProps, UsersGroupPropsSlice } from "./Types";
import { getUsersAndGroupsApi } from "./users";

const initialState: UsersGroupPropsSlice = {
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
		builder.addCase(fetchUsersAndGroups.fulfilled, (state, action: PayloadAction<UsersGroupProps>) => {
			state.users = action.payload.users;
			state.groups = action.payload.groups;
			state.loaded = Date.now();
		});
	},
});
export default usersGroupSlice.reducer;
