import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import type { CustomFieldsObjectProps, DashboardProps, RepoNamePaths, VacationKeyType } from "@src/Api/Types";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditDashboardConfigTab } from "./dashboard";
import { EditGitConfigTab } from "./git";
import { EditJiraConfigTab } from "./jira";
import { EditMiscellaneousConfigTab } from "./miscellaneous";

const Debug = false;

function EditConfigPage() {
	const [tab, setTab] = useState<string>("Miscellaneous");
	const [host, setHost] = useState<string>("");
	const [port, setPort] = useState<number>(3000);
	const [vacationKey, setVacationKey] = useState<VacationKeyType>("email");
	const [apiKey, setApiKey] = useState<string>("");
	const [apiUrl, setApiUrl] = useState<string>("");
	const [apiConfluenceUrl, setApiConfluenceUrl] = useState<string>("");
	const [userName, setUserName] = useState<string>("");
	const [doneStatus, setDoneStaus] = useState<string[]>([]);
	const [customFields, setCustomFields] = useState<CustomFieldsObjectProps>({});
	const [gitRepoPaths, setGitRepoPaths] = useState<{ [key: string]: RepoNamePaths }>({});
	const [gitToken, setGitToken] = useState<string>("");
	const [dashboards, setDashboards] = useState<{ [key: string]: DashboardProps }>({});
	const [dashboardSpeed, setDashboardSpeed] = useState<number>(10);
	const [dashboardDucks, setDashboardDucks] = useState<boolean>(true);
	const config = useSelector((state: RootState) => state.configState);
	const dispatch = useDispatch<AppDispatch>();
	const [loading, setLoading] = useState<boolean>(true);
	const [allowVacationEdit, setAllowVacationEdit] = useState<boolean>(true);
	const [editApiKey, setEditApiKey] = useState<boolean>(true);
	const [editToken, setEditToken] = useState<boolean>(true);

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
	}, [config]);
	const handleChange = (_event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	if (loading) {
		return <></>;
	}
	return (
		<>
			<TabContext value={tab}>
				<TabList onChange={handleChange}>
					<Tab label="Miscellaneous" value="Miscellaneous" />
					<Tab label="Jira" value="Jira" />
					<Tab label="Git" value="Git" />
					<Tab label="Dashboards" value="Dashboards" />
				</TabList>
				<TabPanel value="Miscellaneous">
					<EditMiscellaneousConfigTab
						host={host}
						setHost={setHost}
						port={port}
						setPort={setPort}
						vacationKey={vacationKey}
						setVacationKey={setVacationKey}
						allowVacationEdit={allowVacationEdit}
						setAllowVacationEdit={setAllowVacationEdit}
						origVacationEdit={config.ALLOW_VACATION_EDITS}
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
				<TabPanel value="Dashboards">
					<EditDashboardConfigTab
						dashboardSpeed={dashboardSpeed}
						setDashboardSpeed={setDashboardSpeed}
						dashboards={dashboards}
						setDashboards={setDashboards}
						dashboardDucks={dashboardDucks}
						setDashboardDucks={setDashboardDucks}
					/>
				</TabPanel>
			</TabContext>
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

export default EditConfigPage;
