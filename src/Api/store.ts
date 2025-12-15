import { configureStore } from "@reduxjs/toolkit";
import gitBranchReducer from "./gitSlice";
import ticketsReducer from "./ticketsSlice";
import usersGroupReducer from "./usersSlice";
import wikiReducer from "./wikiSlice";
import wikiSpacesReducer from "./wikiSpacesSlice";

export const store = configureStore({
	reducer: {
		usersAndGroupsState: usersGroupReducer,
		ticketsState: ticketsReducer,
		gitBranchState: gitBranchReducer,
		wikiReducer: wikiReducer,
		wikiSpacesReducer: wikiSpacesReducer,
	},
});

// Optional: Define types for your RootState and AppDispatch for TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
