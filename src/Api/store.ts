import { configureStore } from "@reduxjs/toolkit";
import gitBranchReducer from "./git/gitBranchesSlice";
import ticketsReducer from "./ticketsSlice";
import usersGroupReducer from "./usersSlice";
import wikiPagesReducer from "./wiki/wikiPagesSlice";
import wikiReducer from "./wiki/wikiSlice";
import wikiSpacesReducer from "./wiki/wikiSpacesSlice";

export const store = configureStore({
	reducer: {
		usersAndGroupsState: usersGroupReducer,
		ticketsState: ticketsReducer,
		gitBranchState: gitBranchReducer,
		wikiReducer: wikiReducer,
		wikiSpacesReducer: wikiSpacesReducer,
		wikiPagesReducer: wikiPagesReducer,
	},
});

// Optional: Define types for your RootState and AppDispatch for TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
