import { configureStore } from "@reduxjs/toolkit";
import ticketsReducer from "./ticketsSlice";
import usersGroupReducer from "./usersSlice";

export const store = configureStore({
	reducer: {
		usersAndGroupsState: usersGroupReducer,
		ticketsState: ticketsReducer,
	},
});

// Optional: Define types for your RootState and AppDispatch for TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
