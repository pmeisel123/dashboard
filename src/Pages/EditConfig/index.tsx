import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import type { CustomFieldsObjectProps, DashboardProps, RepoNamePaths, VacationKeyType } from "@src/Api/Types";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { EditDashboardConfigTab } from "./dashboard";
import { EditGitConfigTab } from "./git";
import { EditJiraConfigTab } from "./jira";
import { EditMiscellaneousConfigTab } from "./miscellaneous";

const Debug = false;

declare const __HOST__: string;
declare const __PORT__: number;
declare const __VACATION_KEY__: VacationKeyType;
declare const __API_URL__: string;
declare const __API_CONFLUENCE_URL__: string;
declare const __CUSTOM_FIELDS__: CustomFieldsObjectProps;
declare const __DONE_STATUS__: string[];
declare const __GIT_REPOS_PATHS__: { [key: string]: RepoNamePaths };
declare const __DASHBOARDS__: { [key: string]: DashboardProps };
declare const __DASHBOARD_SPEED_SECONDS__: number;

function EditConfigPage() {
	const [tab, setTab] = useState<string>("Miscellaneous");
	const [host, setHost] = useState<string>(__HOST__ || "");
	const [port, setPort] = useState<string>(__PORT__ + "" || "3000");
	const [vacationKey, setVacationKey] = useState<VacationKeyType>(__VACATION_KEY__ || "email");
	const [apiKey, setApiKey] = useState<string>("");
	const [apiUrl, setApiUrl] = useState<string>(__API_URL__ || "");
	const [apiConfluenceUrl, setApiConfluenceUrl] = useState<string>(__API_CONFLUENCE_URL__ || "");
	const [userName, setUserName] = useState<string>("");
	const [doneStatus, setDoneStaus] = useState<string[]>(__DONE_STATUS__ || []);
	const [customFields, setCustomFields] = useState<CustomFieldsObjectProps>(__CUSTOM_FIELDS__ || {});
	const [gitRepoPaths, setGitRepoPaths] = useState<{ [key: string]: RepoNamePaths }>(__GIT_REPOS_PATHS__ || {});
	const [gitToken, setGitToken] = useState<string>("");
	const [dashboards, setDashboards] = useState<{ [key: string]: DashboardProps }>(__DASHBOARDS__ || {});
	const [dashboardSpeed, setDashboardSpeed] = useState<number>(__DASHBOARD_SPEED_SECONDS__ || 10);

	const handleChange = (_event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

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
					/>
				</TabPanel>
				<TabPanel value="Git">
					<EditGitConfigTab
						gitToken={gitToken}
						setGitToken={setGitToken}
						gitRepoPaths={gitRepoPaths}
						setGitRepoPaths={setGitRepoPaths}
					/>
				</TabPanel>
				<TabPanel value="Dashboards">
					<EditDashboardConfigTab
						dashboardSpeed={dashboardSpeed}
						setDashboardSpeed={setDashboardSpeed}
						dashboards={dashboards}
						setDashboards={setDashboards}
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
					<br />
				</>
			)}
		</>
	);
}

export default EditConfigPage;
