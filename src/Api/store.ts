import { configureStore } from '@reduxjs/toolkit';
import usersGroupReducer from './userSlice';

export const store = configureStore({
	reducer: {
		usersAndGroupsState: usersGroupReducer,
	},
});

// Optional: Define types for your RootState and AppDispatch for TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;