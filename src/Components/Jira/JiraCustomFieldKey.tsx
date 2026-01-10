import { TextField } from "@mui/material";
import type { CustomFieldsObjectProps } from "@src/Api/Types";
import type { FC } from "react";
import { useEffect, useState } from "react";

export const JiraEditCustomFieldKey: FC<{
	customFields: CustomFieldsObjectProps;
	updateRow: (index: number, newKey: string) => void;
	currentKey: string;
	index: number;
}> = ({ customFields, updateRow, currentKey, index }) => {
	const [localKey, setLocalKey] = useState<string>(currentKey);
	const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
	useEffect(() => {
		if (localKey != currentKey) {
			console.log(1);
			setLocalKey(currentKey);
		}
	}, [currentKey]);
	useEffect(() => {
		if (localKey != currentKey) {
			console.log(2);
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

	return (
		<TextField
			id="currenKey"
			value={localKey}
			onChange={(event) => {
				setLocalKey(event.target.value);
			}}
			helperText={isDuplicate ? "Duplicate Key" : ""}
		/>
	);
};
