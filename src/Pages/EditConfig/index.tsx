import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { EditJiraConfigTab } from "./jira";
import { EditMiscellaneousConfigTab } from "./miscellaneous";
// import type { CustomFieldsObjectProps, DashboardsProps, ReposProps, VacationKeyType } from './src/Api/Types';
import type { CustomFieldsObjectProps, VacationKeyType } from "@src/Api/Types";

declare const __HOST__: string;
declare const __PORT__: number;
declare const __VACATION_KEY__: VacationKeyType;
declare const __API_KEY_DEFINED__: boolean;
declare const __API_URL__: string;
declare const __API_CONFLUENCE_URL__: string;
declare const __API_USERNAME_DEFINED__: boolean;
declare const __CUSTOM_FIELDS__: CustomFieldsObjectProps;
declare const __DONE_STATUS__: string[];

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
	const [editApiKey, setEditApiKey] = useState<boolean>(!__API_KEY_DEFINED__);
	const [editUserKey, setsetEditUserKey] = useState<boolean>(!__API_USERNAME_DEFINED__);
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
						editApiKey={editApiKey}
						setEditApiKey={setEditApiKey}
						editUserKey={editUserKey}
						setEditUserKey={setsetEditUserKey}
					/>
				</TabPanel>
				<TabPanel value="Git">Git</TabPanel>
				<TabPanel value="Dashboards">Dashboards</TabPanel>
			</TabContext>
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
			<br />
			editApiKey={editApiKey ? "true" : "false"}
			<br />
			editUserKey={editUserKey ? "true" : "false"}
			<pre>customFields={JSON.stringify(customFields, null, 2)}</pre>
			<br />
		</>
	);
}

export default EditConfigPage;
