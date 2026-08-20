import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, InputLabel, TextField } from "@mui/material";
import type { EditableRow, SlackTokensType } from "@src/Api/Types";
import { UniqueTextFieldFieldKey } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";

export const EditSlackConfigTab: FC<{
	slackTokens: SlackTokensType;
	setSlackTokens: Dispatch<SetStateAction<SlackTokensType>>;
	editSlackToken: boolean;
	setEditSlackToken: Dispatch<SetStateAction<boolean>>;
}> = ({ slackTokens, setSlackTokens, editSlackToken, setEditSlackToken }) => {
	const [rows, setRows] = useState<EditableRow[]>(() =>
		Object.keys(slackTokens)
			.sort()
			.map((key) => ({
				key: key,
			})),
	);

	const updateRowKey = (index: number, newKey: string) => {
		const current_key = rows[index].key;
		if (current_key != newKey) {
			const new_rows = [...rows];
			new_rows[index].key = newKey;
			setRows(new_rows);
			const newItems = { ...slackTokens };
			newItems[newKey] = newItems[current_key];
			delete newItems[current_key];
			setSlackTokens(newItems);
		}
	};
	const deletRow = (index: number) => {
		const oldkey = rows[index].key;
		const newItems = { ...slackTokens };
		delete newItems[oldkey];
		setSlackTokens(newItems);
		const new_rows = [...rows];
		new_rows.splice(index, 1);
		setRows(new_rows);
	};
	const updateToken = (index: number, value: string) => {
		const current_key = rows[index].key;
		const newItems = { ...slackTokens };
		newItems[current_key] = value;
		setSlackTokens(newItems);
	};
	const addRow = () => {
		const newItems = { ...slackTokens };
		const newKey = "";
		if (!newItems[newKey]) {
			newItems[newKey] = "";
		}
		setSlackTokens(newItems);
		const new_rows = [...rows];
		new_rows.push({
			key: newKey,
		});
		setRows(new_rows);
	};
	return (
		<Box sx={{ width: "100%" }}>
			<InputLabel id="api_key">Slack Tokens</InputLabel>
			{!editSlackToken && (
				<Grid container spacing={2} sx={{ width: "100%" }}>
					<Grid sx={{ width: "325px" }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setEditSlackToken(true);
							}}
						>
							Override Slack Tokens
						</Button>
					</Grid>
				</Grid>
			)}
			<InputLabel id="repos">
				Tokens
				<span>
					<IconButton
						edge="end"
						aria-label="delete"
						onClick={() => addRow()}
						disabled={"" in slackTokens || !editSlackToken}
					>
						<Add titleAccess="Add" />
					</IconButton>
				</span>
			</InputLabel>
			<Grid container spacing={2} sx={{ width: "100%" }} key="headr">
				<Grid sx={{ width: "30px", paddingTop: "7px", display: { xs: "none", md: "block" } }}></Grid>
				<Grid size={{ xs: 12, md: 3 }}>Name</Grid>
				<Grid size={{ xs: 12, md: 8 }}>Token</Grid>
			</Grid>
			{rows.map((item, index) => {
				const key = item.key;
				return (
					<Grid container spacing={2} sx={{ width: "100%" }} key={index}>
						<Grid sx={{ width: "30px", paddingTop: "7px", display: { xs: "none", md: "block" } }}>
							<IconButton aria-label="delete" onClick={() => deletRow(index)}>
								<Delete titleAccess="Delete" />
							</IconButton>
						</Grid>
						<Grid size={{ xs: 12, md: 3 }}>
							<UniqueTextFieldFieldKey
								object={slackTokens}
								updateRow={updateRowKey}
								currentKey={key}
								index={index}
								disabled={!editSlackToken || !slackTokens[key]}
								disabledText={
									!editSlackToken
										? "Click OVERRIDE SLACK TOKENS button to edit"
										: "Enter new token override name"
								}
								placeholder="Dashboard"
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 8 }}>
							<TextField
								value={slackTokens[key]}
								fullWidth
								type="url"
								onChange={(event) => {
									updateToken(index, event.target.value);
								}}
								disabled={!editSlackToken}
								placeholder="Replace current Token"
							/>
						</Grid>
					</Grid>
				);
			})}
		</Box>
	);
};
