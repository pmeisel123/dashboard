import { TextField } from "@mui/material";
import type { FC } from "react";
import { useEffect, useState } from "react";

export const UniqueTextFieldFieldKey: FC<{
	object: { [key: string]: any };
	updateRow: (index: number, newKey: string) => void;
	currentKey: string;
	disabled: boolean;
	placeholder?: string;
	index: number;
}> = ({ object, updateRow, currentKey, disabled, placeholder, index }) => {
	const [localKey, setLocalKey] = useState<string>(currentKey);
	const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
	useEffect(() => {
		if (localKey == currentKey) {
			return;
		}
		if (localKey in object) {
			setIsDuplicate(true);
			return;
		}
		setIsDuplicate(false);
		const timeout = setTimeout(() => {
			updateRow(index, localKey);
		}, 500);
		return () => {
			clearTimeout(timeout);
		};
	}, [localKey]);
	return (
		<>
			<TextField
				error={isDuplicate}
				helperText={disabled ? "Input Token to Update Repos" : isDuplicate ? "Duplicate Key" : " "}
				id="currenKey"
				value={localKey}
				onChange={(event) => {
					setLocalKey(event.target.value);
				}}
				fullWidth
				disabled={disabled}
				key={index}
				placeholder={placeholder}
			/>
		</>
	);
};
