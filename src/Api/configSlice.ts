import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ConfigProps, LoadedSlice } from "./Types";
import { getConfigApi } from "./config";

const initialState: ConfigProps & LoadedSlice = {
	ALLOW_VACATION_EDITS: true,
	API_CONFLUENCE_URL: "",
	API_KEY_DEFINED: false,
	API_URL: "",
	CUSTOM_FIELDS: {},
	DASHBOARDS: {},
	DASHBOARD_DUCKS: true,
	DASHBOARD_SPEED_SECONDS: 30,
	DONE_STATUS: ["Done"],
	GITTOKEN_DEFINED: false,
	HOST: "",
	PORT: 3000,
	VACATION_KEY: "email",
	GIT_REPOS_PATHS: {},
	loaded: null,
};

export const fetchConfig = createAsyncThunk("config/fetchConfig", async () => {
	const data: ConfigProps = await getConfigApi();
	return data;
});

export const configSlice = createSlice({
	name: "Config",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchConfig.fulfilled, (state, action: PayloadAction<ConfigProps>) => {
			state.ALLOW_VACATION_EDITS = action.payload.ALLOW_VACATION_EDITS;
			state.API_CONFLUENCE_URL = action.payload.API_CONFLUENCE_URL;
			state.API_KEY_DEFINED = action.payload.API_KEY_DEFINED;
			state.API_URL = action.payload.API_URL;
			state.CUSTOM_FIELDS = action.payload.CUSTOM_FIELDS;
			state.DASHBOARDS = action.payload.DASHBOARDS;
			state.DASHBOARD_DUCKS = action.payload.DASHBOARD_DUCKS;
			state.DASHBOARD_SPEED_SECONDS = action.payload.DASHBOARD_SPEED_SECONDS;
			state.DONE_STATUS = action.payload.DONE_STATUS;
			state.GITTOKEN_DEFINED = action.payload.GITTOKEN_DEFINED;
			state.HOST = action.payload.HOST;
			state.PORT = action.payload.PORT;
			state.VACATION_KEY = action.payload.VACATION_KEY;
			state.GIT_REPOS_PATHS = action.payload.GIT_REPOS_PATHS;
			state.loaded = Date.now();
		});
	},
});
export default configSlice.reducer;
