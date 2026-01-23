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
	ALLOW_CONFIG_EDIT: true,
	ALLOW_DASHBOARD_EDIT: true,
	DUCKS: [],
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
			Object.assign(state, action.payload);
			state.loaded = Date.now();
		});
	},
});
export default configSlice.reducer;
