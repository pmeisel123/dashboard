import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Alert, Button, Tab } from "@mui/material";
import type { AppDispatch, ReposProps, RootState, RoutePageProps } from "@src/Api";
import { fetchConfig, fetchUsersAndGroups, isSliceRecent, postConfigApi } from "@src/Api";
import type {
	ConfigProps,
	ConfigPropsFile,
	CustomFieldsObjectProps,
	CustomNavLinks,
	DashboardProps,
	RepoNamePaths,
	SlackTokensType,
	VacationKeyType,
} from "@src/Api/Types";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { EditCustonNavTab } from "./customnav";
import { EditDashboardConfigTab } from "./dashboard";
import { EditGitConfigTab } from "./git";
import { EditGoogleGeminiConfigTab } from "./googleapi";
import { EditJiraConfigTab } from "./jira";
import { EditMiscellaneousConfigTab } from "./miscellaneous";
import { EditSlackConfigTab } from "./slack";

const Debug = false;

function EditConfigPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [tab, setTab] = useState<string>(searchParams.get("tab") || "Miscellaneous");
	const [host, setHost] = useState<string>("");
	const [port, setPort] = useState<number>(3000);
	const [useSsl, setUseSsl] = useState<boolean>(false);
	const [vacationKey, setVacationKey] = useState<VacationKeyType>("email");
	const [apiKey, setApiKey] = useState<string>("");
	const [apiUrl, setApiUrl] = useState<string>("");
	const [apiConfluenceUrl, setApiConfluenceUrl] = useState<string>("");
	const [userName, setUserName] = useState<string>("");
	const [doneStatus, setDoneStaus] = useState<string[]>([]);
	const [customFields, setCustomFields] = useState<CustomFieldsObjectProps>({});
	const [gitRepoPaths, setGitRepoPaths] = useState<{ [key: string]: RepoNamePaths }>({});
	const [gitToken, setGitToken] = useState<string>("");
	const [editToken, setEditToken] = useState<boolean>(true);
	const [editSlackToken, setEditSlackToken] = useState<boolean>(true);
	const [slackTokens, setSlackTokens] = useState<SlackTokensType>({});
	const [dashboards, setDashboards] = useState<{ [key: string]: DashboardProps }>({});
	const [dashboardSpeed, setDashboardSpeed] = useState<number>(10);
	const [dashboardDucks, setDashboardDucks] = useState<boolean>(true);
	const [allowVacationEdit, setAllowVacationEdit] = useState<boolean>(true);
	const [allowConfigEdit, setAllowConfigEdit] = useState<boolean>(true);
	const [allowDashboardEdit, setAllowDashboardEdit] = useState<boolean>(true);
	const [editApiKey, setEditApiKey] = useState<boolean>(true);
	const [geminiApiKeys, setGeminiApiKeys] = useState<string[]>([]);
	const [editGeminiApiKeys, setEditGeminiApiKeys] = useState<boolean>(true);
	const [links, setLinks] = useState<{ [key: string]: CustomNavLinks }>({});
	const config = useSelector((state: RootState) => state.configState);
	const dispatch = useDispatch<AppDispatch>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (tab) {
			newSearchParams.set("tab", tab);
		} else {
			newSearchParams.delete("tab");
		}
		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [tab]);

	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab) {
			setTab(tab);
		}
	}, [searchParams]);

	useEffect(() => {
		if (isSliceRecent(config)) {
			setLoading(false);
		} else {
			setLoading(true);
			dispatch(fetchConfig()).then(() => {
				setLoading(false);
			});
		}
	}, [dispatch]);
	useEffect(() => {
		setHost(config.HOST);
		setPort(config.PORT);
		setUseSsl(config.USE_SSL);
		setVacationKey(config.VACATION_KEY);
		setAllowVacationEdit(config.ALLOW_VACATION_EDITS);
		setApiConfluenceUrl(config.API_CONFLUENCE_URL);
		setEditApiKey(!config.API_KEY_DEFINED);
		setApiUrl(config.API_URL);
		setEditToken(!config.GITTOKEN_DEFINED);
		setCustomFields(config.CUSTOM_FIELDS);
		setDashboards(config.DASHBOARDS);
		setDashboardDucks(config.DASHBOARD_DUCKS);
		setDashboardSpeed(config.DASHBOARD_SPEED_SECONDS);
		setDoneStaus(config.DONE_STATUS);
		setGitRepoPaths(config.GIT_REPOS_PATHS);
		setAllowConfigEdit(config.ALLOW_CONFIG_EDIT);
		setAllowDashboardEdit(config.ALLOW_DASHBOARD_EDIT);
		setLinks(config.CUSTOM_NAV_LINKS || {});
		setEditGeminiApiKeys(!config.GEMINI_API_KEY_DEFINED);
		const localSlackToken: SlackTokensType = slackTokens;
		config.SLACK_TOKEN_KEYS.forEach((token) => {
			if (!("token" in localSlackToken)) {
				localSlackToken[token] = "";
			}
		});
		setSlackTokens(localSlackToken);
		if (config.SLACK_TOKEN_KEYS.length) {
			setEditSlackToken(false);
		}
	}, [config]);

	const handleChange = (_event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	const save = () => {
		setLoading(true);
		const repos: ReposProps[] = [];
		Object.keys(gitRepoPaths).forEach((repo_name) => {
			repos.push({
				name: repo_name,
				url: gitRepoPaths[repo_name].url,
			});
		});
		const newConfig: ConfigPropsFile = {
			ALLOW_CONFIG_EDIT: allowConfigEdit,
			ALLOW_DASHBOARD_EDIT: allowDashboardEdit,
			ALLOW_VACATION_EDITS: allowVacationEdit,
			HOST: host,
			PORT: port,
			USE_SSL: useSsl,
			API_USERNAME: userName,
			VACATION_KEY: vacationKey,
			API_CONFLUENCE_URL: apiConfluenceUrl,
			API_KEY: apiKey,
			API_URL: apiUrl,
			GITTOKEN: gitToken,
			CUSTOM_FIELDS: customFields,
			DASHBOARDS: dashboards,
			DASHBOARD_DUCKS: dashboardDucks,
			DASHBOARD_SPEED_SECONDS: dashboardSpeed,
			DONE_STATUS: doneStatus,
			GITREPOS: repos,
			CUSTOM_NAV_LINKS: links || {},
			GEMINI_API_KEYS: geminiApiKeys,
			SLACK_TOKENS: slackTokens,
		};
		postConfigApi(newConfig).then(() => {
			if (useSsl != config.USE_SSL || host != config.HOST || port != config.PORT) {
				window.location.href = `${useSsl ? "https" : "http"}://${host}:${port}`;
			} else {
				dispatch(fetchConfig()).then((data) => {
					setLoading(false);
					dispatch(fetchUsersAndGroups(data.payload as ConfigProps));
				});
			}
		});
	};

	if (loading) {
		return <></>;
	}
	return (
		<>
			{!config.ALLOW_CONFIG_EDIT && (
				<Alert severity="warning">
					Edits Have Been Disabled
					<br />
					To turn it back on, connect to the server, end edit config.json by hand and change
					<br />
					ALLOW_CONFIG_EDIT: false to ALLOW_CONFIG_EDIT: true
					<br />
				</Alert>
			)}
			<TabContext value={tab}>
				<TabList onChange={handleChange}>
					<Tab label="Miscellaneous" value="Miscellaneous" />
					<Tab label="Jira" value="Jira" />
					<Tab label="Git" value="Git" />
					<Tab label="Slack" value="Slack" />
					<Tab label="Google Gemini" value="GoogleGemini" />
					<Tab label="Dashboards" value="Dashboards" />
					<Tab label="Custon Links" value="CustonLinks" />
				</TabList>
				<Button
					variant="contained"
					onClick={save}
					sx={{ marginLeft: "100px", width: "4em" }}
					disabled={!config.ALLOW_CONFIG_EDIT}
				>
					Save
				</Button>
				<TabPanel value="Miscellaneous">
					<EditMiscellaneousConfigTab
						host={host}
						setHost={setHost}
						port={port}
						setPort={setPort}
						useSsl={useSsl}
						setUseSsl={setUseSsl}
						vacationKey={vacationKey}
						setVacationKey={setVacationKey}
						allowVacationEdit={allowVacationEdit}
						setAllowVacationEdit={setAllowVacationEdit}
						origVacationEdit={config.ALLOW_VACATION_EDITS}
						allowConfigEdit={allowConfigEdit}
						setAllowConfigEdit={setAllowConfigEdit}
						origAllowConfigEdit={config.ALLOW_CONFIG_EDIT}
						allowDashboardEdit={allowDashboardEdit}
						setAllowDashboardEdit={setAllowDashboardEdit}
						origAllowDashboardEdit={config.ALLOW_DASHBOARD_EDIT}
						config={config}
					/>
				</TabPanel>
				<TabPanel value="Jira">
					<EditJiraConfigTab
						apiKey={apiKey}
						setApiKey={setApiKey}
						apiUrl={apiUrl}
						setApiUrl={setApiUrl}
						apiConfluenceUrl={apiConfluenceUrl}
						setApiConfluenceUrl={setApiConfluenceUrl}
						userName={userName}
						setUserName={setUserName}
						doneStatus={doneStatus}
						setDoneStaus={setDoneStaus}
						customFields={customFields}
						setCustomFields={setCustomFields}
						editApiKey={editApiKey}
						setEditApiKey={setEditApiKey}
					/>
				</TabPanel>
				<TabPanel value="Git">
					<EditGitConfigTab
						gitToken={gitToken}
						setGitToken={setGitToken}
						gitRepoPaths={gitRepoPaths}
						setGitRepoPaths={setGitRepoPaths}
						editToken={editToken}
						setEditToken={setEditToken}
					/>
				</TabPanel>
				<TabPanel value="Slack">
					<EditSlackConfigTab
						slackTokens={slackTokens}
						setSlackTokens={setSlackTokens}
						editSlackToken={editSlackToken}
						setEditSlackToken={setEditSlackToken}
					/>
				</TabPanel>
				<TabPanel value="GoogleGemini">
					<EditGoogleGeminiConfigTab
						geminiApiKeys={geminiApiKeys}
						setGeminiApiKeys={setGeminiApiKeys}
						editGeminiApiKeys={editGeminiApiKeys}
						setEditGeminiApiKeys={setEditGeminiApiKeys}
					/>
				</TabPanel>
				<TabPanel value="Dashboards">
					{config.ALLOW_DASHBOARD_EDIT && (
						<EditDashboardConfigTab
							dashboardSpeed={dashboardSpeed}
							setDashboardSpeed={setDashboardSpeed}
							dashboards={dashboards}
							setDashboards={setDashboards}
							dashboardDucks={dashboardDucks}
							setDashboardDucks={setDashboardDucks}
						/>
					)}
					{!config.ALLOW_DASHBOARD_EDIT && (
						<Alert severity="warning">
							Edit Dashboard has been turned off.
							<br />
							To turn it back on, connect to the server, end edit config.json by hand and change
							<br />
							ALLOW_DASHBOARD_EDIT: false to ALLOW_DASHBOARD_EDIT: true
						</Alert>
					)}
				</TabPanel>
				<TabPanel value="CustonLinks">
					<EditCustonNavTab links={links} setLinks={setLinks} />
				</TabPanel>
			</TabContext>
			<Button variant="contained" onClick={save} sx={{ width: "4em" }} disabled={!config.ALLOW_CONFIG_EDIT}>
				Save
			</Button>
			{Debug && (
				<>
					Fields: <br />
					tab: {tab}
					<br />
					host: {host}
					<br />
					port: {port}
					<br />
					vacationKey: {vacationKey}
					<br />
					apiKey={apiKey}
					<br />
					apiUrl={apiUrl}
					<br />
					apiConfluenceUrl={apiConfluenceUrl}
					<br />
					userName={userName}
					<br />
					doneStatus=["{doneStatus.join('", "')}"]
					<pre>customFields={JSON.stringify(customFields, null, 2)}</pre>
					gitToken={gitToken}
					<pre>gitRepoPaths={JSON.stringify(gitRepoPaths, null, 2)}</pre>
					dashboardSpeed={dashboardSpeed}
					<pre>dashboards={JSON.stringify(dashboards, null, 2)}</pre>
					dashboardDucks={JSON.stringify(dashboardDucks)}
					<br />
				</>
			)}
		</>
	);
}

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/EditConfig",
		name: "Edit Config",
		element: <EditConfigPage />,
		description: <>Allow Editting of the config for this site</>,
	},
];
