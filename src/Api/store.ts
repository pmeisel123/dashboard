import { configureStore } from "@reduxjs/toolkit";
import gitBranchReducer from "./git/gitBranchesSlice";
import gitLatestReleaseReducer from "./git/gitLatetReleaseSlice";
import gitReleasesReducer from "./git/gitReleasesSlice";
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
		gitReleasesState: gitReleasesReducer,
		gitLatestReleaseState: gitLatestReleaseReducer,
		wikiState: wikiReducer,
		wikiSpacesState: wikiSpacesReducer,
		wikiPagesState: wikiPagesReducer,
	},
});

// Optional: Define types for your RootState and AppDispatch for TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const isSliceRecent = (slice: { loaded: number | null }) => {
	if (!slice.loaded) {
		return false;
	}
	const TEN_MINUTES_MS = 1000 * 60 * 10;
	return slice.loaded && slice.loaded > Date.now() - TEN_MINUTES_MS;
};
