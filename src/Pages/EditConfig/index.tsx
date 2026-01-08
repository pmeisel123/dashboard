import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { EditMiscellaneousConfigTab } from "./miscellaneous";

declare const __HOST__: string;
declare const __PORT__: number;

function EditConfigPage() {
	const [tab, setTab] = useState<string>("Miscellaneous");
	const [host, setHost] = useState<string>(__HOST__ || "");
	const [port, setPort] = useState<string>(__PORT__ + "" || "3000");
	const handleChange = (_event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	return (
		<TabContext value={tab}>
			<TabList onChange={handleChange}>
				<Tab label="Miscellaneous" value="Miscellaneous" />
				<Tab label="Jira" value="Jira" />
				<Tab label="Git" value="Git" />
				<Tab label="Dashboards" value="Dashboards" />
			</TabList>
			<TabPanel value="Miscellaneous">
				<EditMiscellaneousConfigTab host={host} setHost={setHost} port={port} setPort={setPort} />
			</TabPanel>
			<TabPanel value="Jira">Jira</TabPanel>
			<TabPanel value="Git">Git</TabPanel>
			<TabPanel value="Dashboards">Dashboards</TabPanel>
		</TabContext>
	);
}

export default EditConfigPage;
