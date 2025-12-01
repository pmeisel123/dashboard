import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { UsersGroupProps, UsersGroupPropsSlice } from "./types";
import { getUsersAndGroupsApi } from "./users";

const initialState: UsersGroupPropsSlice = {
	groups: [],
	users: {},
	loaded: null,
};

export const fetchUsersAndGroups = createAsyncThunk(
	"users/fetchUsersAndGroups",
	async () => {
		const data: UsersGroupProps = await getUsersAndGroupsApi();
		return data;
	},
);

export const usersGroupSlice = createSlice({
	name: "usersandgroups",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			fetchUsersAndGroups.fulfilled,
			(state, action: PayloadAction<UsersGroupProps>) => {
				state.users = action.payload.users;
				state.groups = action.payload.groups;
				state.loaded = Date.now();
			},
		);
	},
});
export const isUserDataRecent = (usersAndGroups: UsersGroupPropsSlice) => {
	// The user api does a lot of sub api calls
	// This is allows it to cache for 10 minutes
	const TEN_MINUTES_MS = 1000 * 60 * 10;
	return (
		usersAndGroups.loaded &&
		usersAndGroups.loaded > Date.now() - TEN_MINUTES_MS
	);
};
export default usersGroupSlice.reducer;
