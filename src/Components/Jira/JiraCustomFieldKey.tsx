import { Autocomplete, TextField } from "@mui/material";
import type { CustomFieldsFromJiraProps, CustomFieldsObjectProps } from "@src/Api/Types";
import type { FC } from "react";
import { useEffect, useState } from "react";

export const JiraEditCustomFieldKey: FC<{
	customFields: CustomFieldsObjectProps;
	updateRow: (index: number, newKey: string) => void;
	currentKey: string;
	jiraCustomFields: CustomFieldsFromJiraProps[];
	index: number;
}> = ({ customFields, updateRow, currentKey, jiraCustomFields, index }) => {
	const [localKey, setLocalKey] = useState<string>(currentKey);
	const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
	useEffect(() => {
		if (localKey != currentKey) {
			setLocalKey(currentKey);
		}
	}, [currentKey]);
	useEffect(() => {
		if (localKey != currentKey) {
			if (customFields[localKey]) {
				setIsDuplicate(true);
			} else {
				setIsDuplicate(false);
				updateRow(index, localKey);
			}
		} else {
			setIsDuplicate(false);
		}
	}, [localKey]);
	const getOptionString = (option: string | CustomFieldsFromJiraProps) => {
		if (typeof option == "string") {
			return option;
		} else {
			return option.Key;
		}
	};

	return (
		<>
			<Autocomplete
				freeSolo
				id="currenKey"
				value={localKey}
				onInputChange={(_, newInputValue) => {
					setLocalKey(newInputValue);
				}}
				renderOption={(props, option) => (
					<li {...props} key={option.Key}>
						{option.Key} <small style={{ marginLeft: 8, color: "gray" }}>{option.Name}</small>
					</li>
				)}
				onChange={(_event, newValue) => {
					if (typeof newValue === "string") {
						setLocalKey(newValue);
					} else if (newValue && newValue.Key) {
						setLocalKey(newValue.Key);
					} else {
						setLocalKey("");
					}
				}}
				options={jiraCustomFields}
				getOptionLabel={(option) => getOptionString(option)}
				isOptionEqualToValue={(option, value) => {
					if (typeof value === "string") return option.Key === value;
					return option.Key === value.Key;
				}}
				fullWidth
				renderInput={(params) => <TextField {...params} helperText={isDuplicate ? "Duplicate Key" : ""} />}
			/>
		</>
	);
};
