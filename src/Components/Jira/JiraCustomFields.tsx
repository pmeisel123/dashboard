import * as MuiIcons from "@mui/icons-material";
import { Add, Delete, Info } from "@mui/icons-material";
import { Grid, IconButton, InputLabel, Link, MenuItem, Select, TextField } from "@mui/material";
import type { CustomFieldsObjectProps, CustomFieldsProps } from "@src/Api/Types";
import type { Dispatch, FC, SetStateAction } from "react";
import { createElement, useState } from "react";
import { HtmlTooltip } from "./const";
import { JiraEditCustomFieldKey } from "./JiraCustomFieldKey";

interface EditableRow {
	key: string;
}

export const JiraCustomFields: FC<{
	customFields: CustomFieldsObjectProps;
	setCustomFields: Dispatch<SetStateAction<CustomFieldsObjectProps>>;
}> = ({ customFields, setCustomFields }) => {
	const [rows, setRows] = useState<EditableRow[]>(() =>
		Object.keys(customFields)
			.sort()
			.map((key) => ({
				key: key,
			})),
	);
	const updateRow = (index: number, newKey: string) => {
		const current_key = rows[index].key;
		if (current_key != newKey) {
			const new_rows = [...rows];
			new_rows[index].key = newKey;
			setRows(new_rows);
			const newItems = { ...customFields };
			newItems[newKey] = newItems[current_key];
			delete newItems[current_key];
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
			newItems[key].Name = value;
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
				<IconButton
					edge="end"
					aria-label="delete"
					onClick={() => handleAddCustomField()}
					disabled={!!customFields[""]}
				>
					<Add titleAccess="Add" />
				</IconButton>
			</InputLabel>
			<Grid container spacing={1} sx={{ width: "100%" }} alignItems="center">
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
					<InputLabel>Name</InputLabel>
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
					<Grid key={index} container spacing={1} sx={{ width: "100%" }} alignItems="center">
						<Grid sx={{ width: "30px" }}>
							<IconButton aria-label="delete" onClick={() => handleDeleteCustomField(index)}>
								<Delete titleAccess="Delete" />
							</IconButton>
						</Grid>
						<Grid size={{ xs: 12, md: 3 }}>
							<JiraEditCustomFieldKey
								customFields={customFields}
								updateRow={updateRow}
								currentKey={item.key}
								index={index}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 3 }}>
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
							)}
						</Grid>
						<Grid size="grow">
							{customFields[key].Type == "Link" && getSubType(customFields[key]) == "Icon" && (
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
							)}
							{customFields[key].Type == "Link" && getSubType(customFields[key]) == "Text" && (
								<TextField
									value={customFields[key].LinkText}
									onChange={(event) => {
										setSubTextType(index, event.target.value);
									}}
									fullWidth
								/>
							)}
						</Grid>
					</Grid>
				);
			})}
		</>
	);
};
