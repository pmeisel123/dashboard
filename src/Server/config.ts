import * as fs from "fs";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { dirname, join } from "node:path";
import type { ConfigProps, ConfigPropsFile, RepoNamePaths, SlackTokensType } from "../src/Api/Types";

const filePath = join(process.cwd(), "config.json");
const ducks = fs.readdirSync("./src/assets/ducks/");
const dashboardImageDirectory = "./src/assets/imagesfordashboard";

export const loadConfig = (): ConfigPropsFile => {
	if (fs.existsSync(filePath)) {
		const content = readFileSync(filePath, "utf8");
		if (content) {
			const configFile: ConfigPropsFile = JSON.parse(content);

			return configFile;
		}
	}

	const config: ConfigPropsFile = {
		ALLOW_VACATION_EDITS: true,
		ALLOW_CONFIG_EDIT: true,
		ALLOW_DASHBOARD_EDIT: true,
		API_CONFLUENCE_URL: "",
		API_USERNAME: "",
		API_KEY: "",
		API_URL: "",
		GEMINI_API_KEYS: [],
		CUSTOM_FIELDS: {},
		DASHBOARDS: {
			company: {
				key: "company",
				name: "Company Dashboard",
				pages: [
					{
						name: "Front Page",
						split: "fourways",
						pages: [
							{
								name: "Date",
								url: "/date",
							},
							{
								name: "Time",
								url: "/time",
							},
							{
								name: "Company Dashboard Text",
								url: "/text?text=Company%20Dashboard",
							},
							{
								name: "Next Holiday",
								url: "/nextholiday",
							},
						],
					},
					{
						name: "Recent Tickets",
						url: "/RecentTickets?days=30",
					},
					{
						name: "Who is out",
						url: "/whoisout",
					},
					{
						name: "Holidays",
						url: "/holidays",
					},
				],
			},
		},
		DASHBOARD_DUCKS: true,
		DASHBOARD_SPEED_SECONDS: 30,
		DONE_STATUS: ["Done"],
		GITTOKEN: "",
		HOST: "",
		PORT: 3000,
		USE_SSL: false,
		VACATION_KEY: "email",
		GITREPOS: [],
		SLACK_TOKENS: {},
	};
	return config;
};

const getDashboardDirectoryName = (dashboardKey: string) => {
	return dashboardKey.replace(/[^a-zA-Z0-9]/g, "_");
};

const setDashoardImageDirectory = (dashboardKey: string) => {
	const dashboardDirectoryName = getDashboardDirectoryName(dashboardKey);
	const dashboardDirectoryPath = join(dashboardImageDirectory, dashboardDirectoryName);
	if (!existsSync(dashboardDirectoryPath)) {
		mkdirSync(dashboardDirectoryPath, { recursive: true });
	}
	return dashboardDirectoryPath;
};

export const ConfigServer = (req: IncomingMessage, requestBody: string | null) => {
	if (req.method === "GET") {
		const configFile = loadConfig();
		const git_proxies_name_path: { [key: string]: RepoNamePaths } = {};
		configFile.GITREPOS.forEach((repo, index: number) => {
			const repo_path = "/git_" + index;
			const repo_name = repo.name;

			git_proxies_name_path[repo_name] = {
				path: repo_path,
				url: repo.url,
			};
		});

		if (configFile.DASHBOARDS) {
			Object.keys(configFile.DASHBOARDS).forEach((dashboardKey) => {
				const dashboardDirectoryPath = setDashoardImageDirectory(dashboardKey);
				configFile.DASHBOARDS[dashboardKey].imagesPath = dashboardDirectoryPath;
				const images = fs.readdirSync(dashboardDirectoryPath);
				configFile.DASHBOARDS[dashboardKey].images = images;
			});
		}
		const config: ConfigProps = {
			ALLOW_VACATION_EDITS: configFile.ALLOW_VACATION_EDITS,
			ALLOW_CONFIG_EDIT: configFile.ALLOW_CONFIG_EDIT,
			ALLOW_DASHBOARD_EDIT: configFile.ALLOW_DASHBOARD_EDIT,
			API_CONFLUENCE_URL: configFile.API_KEY ? configFile.API_CONFLUENCE_URL : "",
			API_KEY_DEFINED: configFile.API_KEY ? true : false,
			API_URL: configFile.API_KEY ? configFile.API_URL : "",
			CUSTOM_FIELDS: configFile.CUSTOM_FIELDS || {},
			DASHBOARDS: configFile.DASHBOARDS || {},
			DASHBOARD_DUCKS: configFile.DASHBOARD_DUCKS,
			DASHBOARD_SPEED_SECONDS: configFile.DASHBOARD_SPEED_SECONDS || 30,
			DONE_STATUS: configFile.DONE_STATUS,
			GITTOKEN_DEFINED: configFile.GITTOKEN ? true : false,
			HOST: configFile.HOST,
			PORT: configFile.PORT,
			USE_SSL: configFile.USE_SSL,
			VACATION_KEY: configFile.VACATION_KEY,
			GIT_REPOS_PATHS: git_proxies_name_path,
			DUCKS: ducks,
			CUSTOM_NAV_LINKS: configFile.CUSTOM_NAV_LINKS || {},
			GEMINI_API_KEY_DEFINED:
				configFile.GEMINI_API_KEYS && Object.keys(configFile.GEMINI_API_KEYS).length ? true : false,
			SLACK_TOKEN_KEYS: configFile.SLACK_TOKENS ? Object.keys(configFile.SLACK_TOKENS) : [],
		};
		return JSON.stringify(config, null, 2);
	}
	if (req.method == "POST") {
		const content = readFileSync(filePath, "utf8");
		const configFile: ConfigPropsFile = JSON.parse(content);
		if (!configFile.ALLOW_CONFIG_EDIT || !requestBody) {
			return false;
		}
		const configBody: ConfigPropsFile = JSON.parse(requestBody);
		const hasNewApiCredentials = !!(configBody.API_KEY && configBody.API_USERNAME);
		console.log(configBody.GEMINI_API_KEYS);
		const geminiKeyClean = configBody.GEMINI_API_KEYS
			? configBody.GEMINI_API_KEYS.filter((str) => str.trim() !== "")
			: [];
		let slackTokenClean: SlackTokensType = {};
		Object.keys(configBody.SLACK_TOKENS).forEach((token) => {
			const value = configBody.SLACK_TOKENS[token].trim();
			console.log(token, value);
			if (value == "") {
				if (token in configFile.SLACK_TOKENS) {
					slackTokenClean[token] = configFile.SLACK_TOKENS[token];
				}
			} else {
				slackTokenClean[token] = value;
			}
		});

		const config: ConfigPropsFile = {
			...configBody,

			ALLOW_VACATION_EDITS: configFile.ALLOW_VACATION_EDITS ? configBody.ALLOW_VACATION_EDITS : false,
			ALLOW_DASHBOARD_EDIT: configFile.ALLOW_DASHBOARD_EDIT ? configBody.ALLOW_DASHBOARD_EDIT : false,

			API_KEY: hasNewApiCredentials ? configBody.API_KEY : configFile.API_KEY,
			API_URL: hasNewApiCredentials ? configBody.API_URL : configFile.API_URL,
			API_USERNAME: hasNewApiCredentials ? configBody.API_USERNAME : configFile.API_USERNAME,

			GITTOKEN: configBody.GITTOKEN ? configBody.GITTOKEN : configFile.GITTOKEN,
			GITREPOS: configBody.GITTOKEN ? configBody.GITREPOS : configFile.GITREPOS,

			GEMINI_API_KEYS:
				geminiKeyClean && Object.keys(geminiKeyClean).length ? geminiKeyClean : configFile.GEMINI_API_KEYS,
			SLACK_TOKENS: slackTokenClean ? slackTokenClean : configFile.SLACK_TOKENS,

			DASHBOARDS: configFile.ALLOW_DASHBOARD_EDIT ? configBody.DASHBOARDS : configFile.DASHBOARDS,
			DASHBOARD_DUCKS: configFile.ALLOW_DASHBOARD_EDIT ? configBody.DASHBOARD_DUCKS : configFile.DASHBOARD_DUCKS,
			DASHBOARD_SPEED_SECONDS: configFile.ALLOW_DASHBOARD_EDIT
				? configBody.DASHBOARD_SPEED_SECONDS
				: configFile.DASHBOARD_SPEED_SECONDS,
			DONE_STATUS: configBody.DONE_STATUS.sort((a, b) => {
				return a.localeCompare(b, undefined, { sensitivity: "base" });
			}),
			CUSTOM_NAV_LINKS: configFile.ALLOW_CONFIG_EDIT ? configBody.CUSTOM_NAV_LINKS : configFile.CUSTOM_NAV_LINKS,
		};

		if (existsSync(filePath)) {
			const backupPath = join(process.cwd(), "backup", `config.json.${Date.now()}.bak`);
			mkdirSync(dirname(backupPath), { recursive: true });
			copyFileSync(filePath, backupPath);
			console.log("saved backup: " + backupPath);
		}
		writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
		console.log(`File ${filePath} written successfully!`);
		return JSON.stringify(config, null, 2);
	}
};
