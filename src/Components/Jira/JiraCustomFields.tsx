import * as MuiIcons from "@mui/icons-material";
import { Add, Delete, Info } from "@mui/icons-material";
import { Grid, IconButton, InputLabel, Link, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { getCustomFieldsApi } from "@src/Api";
import type {
	CustomFieldsFromJiraProps,
	CustomFieldsObjectProps,
	CustomFieldsProps,
	EditableRow,
} from "@src/Api/Types";
import type { Dispatch, FC, SetStateAction } from "react";
import { createElement, useEffect, useState } from "react";
import { HtmlTooltip } from "./const";
import { JiraEditCustomFieldKey } from "./JiraCustomFieldKey";

export const JiraCustomFields: FC<{
	customFields: CustomFieldsObjectProps;
	setCustomFields: Dispatch<SetStateAction<CustomFieldsObjectProps>>;
}> = ({ customFields, setCustomFields }) => {
	const [jiraCustomFields, setJiraCustomFields] = useState<CustomFieldsFromJiraProps[]>([]);
	const [jiraFieldKeyName, setJiraFieldKeyName] = useState<{ [key: string]: string }>({});
	const [rows, setRows] = useState<EditableRow[]>(() =>
		Object.keys(customFields)
			.sort()
			.map((key) => ({
				key: key,
			})),
	);
	useEffect(() => {
		getCustomFieldsApi().then((data) => {
			setJiraCustomFields(data);
			if (!Object.keys(jiraFieldKeyName).length) {
				const jiraFieldKeyNameLocal = { ...jiraFieldKeyName };
				data.forEach((record) => {
					jiraFieldKeyNameLocal[record.Key] = record.Name;
				});
				setJiraFieldKeyName(jiraFieldKeyNameLocal);
			}
		});
	}, []);
	const updateRow = (index: number, newKey: string) => {
		const current_key = rows[index].key;
		if (current_key != newKey) {
			const new_rows = [...rows];
			new_rows[index].key = newKey;
			setRows(new_rows);
			const newItems = { ...customFields };
			newItems[newKey] = newItems[current_key];
			let oldName = "";
			if (current_key in jiraFieldKeyName) {
				oldName = jiraFieldKeyName[current_key];
			}
			delete newItems[current_key];
			if ((newItems[newKey].Name == "" || newItems[newKey].Name == oldName) && newKey in jiraFieldKeyName) {
				newItems[newKey].Name = jiraFieldKeyName[newKey];
			}
			setCustomFields(newItems);
		}
	};
	const handleDeleteCustomField = (index: number) => {
		const oldkey = rows[index].key;
		const newItems = { ...customFields };
		delete newItems[oldkey];
		setCustomFields(newItems);
		const new_rows = [...rows];
		new_rows.splice(index, 1);
		setRows(new_rows);
	};
	const handleAddCustomField = () => {
		const newItems = { ...customFields };
		const newKey = "";
		if (!newItems[newKey]) {
			newItems[newKey] = {
				Name: "",
				Type: "Text",
			};
		}
		setCustomFields(newItems);
		const new_rows = [...rows];
		new_rows.push({
			key: newKey,
		});
		setRows(new_rows);
	};
	const handleEditNameCustomField = (index: number, value: string) => {
		const newItems = { ...customFields };
		const key = rows[index].key;
		if (newItems[key].Name != value) {
			newItems[key] = {
				...newItems[key],
				Name: value,
			};
			setCustomFields(newItems);
		}
	};
	const handleEditTypeCustomField = (index: number, value: "Text" | "User" | "Link") => {
		const newItems = { ...customFields };
		const key = rows[index].key;
		if (newItems[key].Type != value) {
			newItems[key] = {
				Name: newItems[key].Name,
				Type: value,
			} as CustomFieldsProps;
			setCustomFields(newItems);
		}
	};
	const getSubType = (field: CustomFieldsProps) => {
		if ("LinkIcon" in field) {
			return "Icon";
		}
		if ("LinkText" in field) {
			return "Text";
		}
		return "Url";
	};
	const setSubType = (index: number, value: "Icon" | "Text" | "Url") => {
		const key = rows[index].key;
		const currentSubType = getSubType(customFields[key]);
		if (currentSubType == value) {
			return;
		}
		const newItems = { ...customFields };
		if (value == "Url") {
			newItems[key] = {
				Name: newItems[key].Name,
				Type: "Link",
			} as CustomFieldsProps;
		}
		if (value == "Text") {
			newItems[key] = {
				Name: newItems[key].Name,
				Type: "Link",
				LinkText: "",
			} as CustomFieldsProps;
		}
		if (value == "Icon") {
			newItems[key] = {
				Name: newItems[key].Name,
				Type: "Link",
				LinkIcon: "Link",
			} as CustomFieldsProps;
		}
		setCustomFields(newItems);
	};
	const setSubIconType = (index: number, value: keyof typeof MuiIcons) => {
		const newItems = { ...customFields };
		const key = rows[index].key;
		newItems[key] = {
			Name: newItems[key].Name,
			Type: "Link",
			LinkIcon: value,
		} as CustomFieldsProps;
		setCustomFields(newItems);
	};
	const setSubTextType = (index: number, value: string) => {
		const newItems = { ...customFields };
		const key = rows[index].key;
		newItems[key] = {
			Name: newItems[key].Name,
			Type: "Link",
			LinkText: value,
		} as CustomFieldsProps;
		setCustomFields(newItems);
	};
	return (
		<>
			<InputLabel id="CustomJiraFields">
				Custom Jira Fields
				<Tooltip title={customFields[""] ? "There is already a blank Jira API field" : ""} arrow>
					<span>
						<IconButton
							edge="end"
							aria-label="delete"
							onClick={() => handleAddCustomField()}
							disabled={!!customFields[""]}
						>
							<Add titleAccess="Add" />
						</IconButton>
					</span>
				</Tooltip>
			</InputLabel>
			<Grid container spacing={1} sx={{ width: "100%", display: { xs: "none", md: "flex" } }}>
				<Grid sx={{ width: "30px" }}></Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel>
						Jira Api Field
						<HtmlTooltip
							title={
								<>
									You can see all the fields&nbsp;
									<Link href="/jira/rest/api/3/field" target="_blank">
										here
									</Link>
								</>
							}
							disableInteractive={false}
							arrow
							placement="right"
						>
							<Info style={{ cursor: "pointer" }} color="action" />
						</HtmlTooltip>
					</InputLabel>
				</Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel>Local Name</InputLabel>
				</Grid>
				<Grid sx={{ width: "90px" }}>
					<InputLabel>Type</InputLabel>
				</Grid>
				<Grid sx={{ width: "90px" }}>
					<InputLabel>Subtype</InputLabel>
				</Grid>
			</Grid>
			{rows.map((item, index) => {
				const key = rows[index].key;
				return (
					<Grid
						key={index}
						container
						spacing={1}
						sx={{
							width: "100%",
							minHeight: "75px",
							border: { xs: "1px solid black", md: 0 },
							marginBottom: { xs: "10px", md: 0 },
							padding: { xs: "10px", md: 0 },
						}}
					>
						<Grid sx={{ width: "30px", paddingTop: "7px", display: { xs: "none", md: "block" } }}>
							<IconButton aria-label="delete" onClick={() => handleDeleteCustomField(index)}>
								<Delete titleAccess="Delete" />
							</IconButton>
						</Grid>
						<Grid size={{ xs: 12, md: 3 }}>
							<IconButton
								sx={{ display: { xs: "block", md: "none" }, float: "right" }}
								aria-label="delete"
								onClick={() => handleDeleteCustomField(index)}
							>
								<Delete titleAccess="Delete" />
							</IconButton>
							<InputLabel sx={{ display: { xs: "block", md: "none" } }}>
								Jira Api Field
								<HtmlTooltip
									title={
										<>
											You can see all the fields&nbsp;
											<Link href="/jira/rest/api/3/field" target="_blank">
												here
											</Link>
										</>
									}
									disableInteractive={false}
									arrow
									placement="right"
								>
									<Info style={{ cursor: "pointer" }} color="action" />
								</HtmlTooltip>
							</InputLabel>
							<JiraEditCustomFieldKey
								customFields={customFields}
								updateRow={updateRow}
								currentKey={item.key}
								jiraCustomFields={jiraCustomFields}
								index={index}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 3 }}>
							<InputLabel sx={{ display: { xs: "block", md: "none" } }}>Local Name</InputLabel>
							<TextField
								id="Name"
								value={customFields[key].Name}
								onChange={(event) => {
									handleEditNameCustomField(index, event.target.value);
								}}
								fullWidth
							/>
						</Grid>
						<Grid sx={{ width: "90px" }}>
							<InputLabel sx={{ display: { xs: "block", md: "none" } }}>Type</InputLabel>
							<Select
								value={customFields[key].Type}
								onChange={(event) => {
									handleEditTypeCustomField(index, event.target.value);
								}}
								sx={{ width: "100%" }}
							>
								{["Text", "User", "Link"].map((value) => (
									<MenuItem key={value} value={value}>
										{value}
									</MenuItem>
								))}
							</Select>
						</Grid>
						<Grid sx={{ width: "90px" }}>
							{customFields[key].Type == "Link" && (
								<>
									<InputLabel sx={{ display: { xs: "block", md: "none" } }}>Sub Type</InputLabel>
									<Select
										value={getSubType(customFields[key])}
										onChange={(event) => {
											setSubType(index, event.target.value);
										}}
										sx={{ width: "100%" }}
									>
										{["Icon", "Text", "Url"].map((value) => (
											<MenuItem key={value} value={value}>
												{value}
											</MenuItem>
										))}
									</Select>
								</>
							)}
						</Grid>
						<Grid size="grow">
							{customFields[key].Type == "Link" && getSubType(customFields[key]) == "Icon" && (
								<>
									<InputLabel sx={{ display: { xs: "block", md: "none" } }}>
										Sub Type Value
									</InputLabel>
									<Select
										value={customFields[key].LinkIcon}
										onChange={(event) => {
											setSubIconType(index, event.target.value);
										}}
										sx={{ width: "100%" }}
									>
										{Object.keys(MuiIcons)
											.filter((name) => !name.match(/(Outlined|Rounded|TwoTone|Sharp)$/))
											.map((value) => (
												<MenuItem key={value} value={value}>
													<div style={{ alignItems: "center", display: "flex" }}>
														{createElement(MuiIcons[value as keyof typeof MuiIcons], {
															sx: { marginRight: "10px", height: "22px" },
														})}
														{value}
													</div>
												</MenuItem>
											))}
									</Select>
								</>
							)}
							{customFields[key].Type == "Link" && getSubType(customFields[key]) == "Text" && (
								<>
									<InputLabel sx={{ display: { xs: "block", md: "none" } }}>
										Sub Type Value
									</InputLabel>
									<TextField
										value={customFields[key].LinkText}
										onChange={(event) => {
											setSubTextType(index, event.target.value);
										}}
										fullWidth
									/>
								</>
							)}
						</Grid>
					</Grid>
				);
			})}
		</>
	);
};
