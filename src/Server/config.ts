// import { writeFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
// import { join } from "node:path";
import type { ConfigProps, RepoNamePaths } from "../src/Api/Types";

import {
	ALLOW_VACATION_EDITS,
	API_CONFLUENCE_URL,
	API_KEY,
	API_URL,
	CUSTOM_FIELDS,
	DASHBOARDS,
	DASHBOARD_DUCKS,
	DASHBOARD_SPEED_SECONDS,
	DONE_STATUS,
	GITREPOS,
	GITTOKEN,
	HOST,
	PORT,
	VACATION_KEY,
} from "../../globals";

const git_proxies_name_path: { [key: string]: RepoNamePaths } = {};
GITREPOS.forEach((repo, index: number) => {
	const repo_path = "/git_" + index;
	const repo_name = repo.name;

	git_proxies_name_path[repo_name] = {
		path: repo_path,
		url: repo.url,
	};
});
export const ConfigServer = (req: IncomingMessage, _requestBody: string | null) => {
	if (req.method === "GET") {
		const config: ConfigProps = {
			ALLOW_VACATION_EDITS: ALLOW_VACATION_EDITS,
			API_CONFLUENCE_URL: API_KEY ? API_CONFLUENCE_URL : "",
			API_KEY_DEFINED: API_KEY ? true : false,
			API_URL: API_KEY ? API_URL : "",
			CUSTOM_FIELDS: CUSTOM_FIELDS || {},
			DASHBOARDS: DASHBOARDS || {},
			DASHBOARD_DUCKS: DASHBOARD_DUCKS,
			DASHBOARD_SPEED_SECONDS: DASHBOARD_SPEED_SECONDS || 30,
			DONE_STATUS: DONE_STATUS,
			GITTOKEN_DEFINED: GITTOKEN ? true : false,
			HOST: HOST,
			PORT: PORT,
			VACATION_KEY: VACATION_KEY,
			GIT_REPOS_PATHS: git_proxies_name_path,
		};
		return JSON.stringify(config);
	}
};
