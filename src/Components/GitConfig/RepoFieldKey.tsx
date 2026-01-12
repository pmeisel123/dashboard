import { TextField } from "@mui/material";
import type { RepoNamePaths } from "@src/Api/Types";
import type { FC } from "react";
import { useEffect, useState } from "react";

export const RepoFieldKey: FC<{
	gitRepoPaths: { [key: string]: RepoNamePaths };
	updateRow: (index: number, newKey: string) => void;
	currentKey: string;
	disabled: boolean;
	index: number;
}> = ({ gitRepoPaths, updateRow, currentKey, disabled, index }) => {
	const [localKey, setLocalKey] = useState<string>(currentKey);
	const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
	useEffect(() => {
		if (localKey != currentKey) {
			setLocalKey(currentKey);
		}
	}, [currentKey]);
	useEffect(() => {
		if (localKey != currentKey) {
			if (localKey in gitRepoPaths) {
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
		<>
			<TextField
				helperText={disabled ? "Input Token to Update Repos" : isDuplicate ? "Duplicate Key" : " "}
				id="currenKey"
				value={localKey}
				onChange={(event) => {
					setLocalKey(event.target.value);
				}}
				fullWidth
				disabled={disabled}
			/>
		</>
	);
};
