import { Add, Delete } from "@mui/icons-material";
import { Box, IconButton, InputLabel } from "@mui/material";
import type { CustomFieldsObjectProps } from "@src/Api/Types";
import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
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
	/*
	const handleEditCustomField = (oldkey: string, key: string, value: CustomFieldsProps) => {
		const newItems = {...customFields};
		if (oldkey != key) {
			if (newItems)
			delete newItems[oldkey];
		}
		newItems[key] = value;
		setCustomFields(newItems);
	};
	*/
	const handleDeleteCustomFields = (index: number) => {
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
			{rows.map((item, index) => (
				<Box key={index}>
					<JiraEditCustomFieldKey
						customFields={customFields}
						updateRow={updateRow}
						currentKey={item.key}
						index={index}
					/>
					<IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCustomFields(index)}>
						<Delete titleAccess="Delete" />
					</IconButton>
				</Box>
			))}
		</>
	);
};
