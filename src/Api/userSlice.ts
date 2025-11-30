import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UsersGroupProps } from './types';
import { getUsersAndGroupsApi } from './users';

const initialState: UsersGroupProps = {
	groups: [],
	users: {},
};

export const fetchUsersAndGroups = createAsyncThunk(
	'users/fetchUsersAndGroups',
	async () => {
	const data: UsersGroupProps = await getUsersAndGroupsApi();
	return data;
  }
);

export const usersGroupSlice = createSlice({
	name: 'usersandgroups',
	initialState,
	reducers: {
		clearUsersAndGroups: (state) => {
			state.users = {};
			state.groups = [];
		},
	},
	extraReducers: (builder) => {
		builder
		.addCase(fetchUsersAndGroups.fulfilled, (state, action: PayloadAction<UsersGroupProps>) => {
			state.users = action.payload.users;
			state.groups = action.payload.groups;
		});
	},
});

export default usersGroupSlice.reducer;