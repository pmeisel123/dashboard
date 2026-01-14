import { Add, Delete, Info } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, InputAdornment, InputLabel, Link, TextField, Tooltip } from "@mui/material";
import type { EditableRow, RepoNamePaths } from "@src/Api/Types";
import { HtmlTooltip, UniqueTextFieldFieldKey } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";

export const EditGitConfigTab: FC<{
	gitToken: string;
	setGitToken: Dispatch<SetStateAction<string>>;
	gitRepoPaths: { [key: string]: RepoNamePaths };
	setGitRepoPaths: Dispatch<SetStateAction<{ [key: string]: RepoNamePaths }>>;
	editToken: boolean;
	setEditToken: Dispatch<SetStateAction<boolean>>;
}> = ({ gitToken, setGitToken, gitRepoPaths, setGitRepoPaths, editToken, setEditToken }) => {
	const [rows, setRows] = useState<EditableRow[]>(() =>
		Object.keys(gitRepoPaths)
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
			const newItems = { ...gitRepoPaths };
			newItems[newKey] = newItems[current_key];
			delete newItems[current_key];
			setGitRepoPaths(newItems);
		}
	};
	const deletRow = (index: number) => {
		const oldkey = rows[index].key;
		const newItems = { ...gitRepoPaths };
		delete newItems[oldkey];
		setGitRepoPaths(newItems);
		const new_rows = [...rows];
		new_rows.splice(index, 1);
		setRows(new_rows);
	};
	const updateUrl = (index: number, value: string) => {
		const current_key = rows[index].key;
		const newItems = { ...gitRepoPaths };
		newItems[current_key].url = value;
		setGitRepoPaths(newItems);
	};
	const addRow = () => {
		const newItems = { ...gitRepoPaths };
		const newKey = "";
		if (!newItems[newKey]) {
			newItems[newKey] = {
				url: "",
				path: "",
			};
		}
		setGitRepoPaths(newItems);
		const new_rows = [...rows];
		new_rows.push({
			key: newKey,
		});
		setRows(new_rows);
	};
	return (
		<Box sx={{ width: "100%" }}>
			<InputLabel id="api_key">Git Token</InputLabel>
			{!editToken && (
				<Grid container spacing={2} sx={{ width: "100%" }}>
					<Grid sx={{ width: "325px" }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setEditToken(true);
							}}
						>
							Override current Git Token
						</Button>
					</Grid>
					<Grid size={{ xs: 12, md: 5 }}>
						An Existing token already exists
						<br />
						<Link href="https://github.com/settings/personal-access-tokens" target="_blank">
							Git tokens
						</Link>
					</Grid>
				</Grid>
			)}
			{editToken && (
				<TextField
					id="api_key"
					value={gitToken}
					onChange={(event) => {
						setGitToken(event.target.value);
					}}
					fullWidth
					helperText=" "
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<HtmlTooltip
									title={
										<>
											Input your Git Token here
											<br />
											<Link
												href="https://github.com/settings/personal-access-tokens"
												target="_blank"
											>
												Git tokens
											</Link>
										</>
									}
									disableInteractive={false}
									arrow
									placement="right"
								>
									<Info style={{ cursor: "pointer" }} color="action" />
								</HtmlTooltip>
							</InputAdornment>
						),
					}}
				/>
			)}
			<InputLabel id="repos">
				Git Repos
				<Tooltip
					title={
						!gitToken
							? "Update the Git Token to add new Url"
							: gitRepoPaths[""]
								? "There is already a blank Repo Name"
								: ""
					}
					arrow
				>
					<span>
						<IconButton
							edge="end"
							aria-label="delete"
							onClick={() => addRow()}
							disabled={!gitToken || !!gitRepoPaths[""]}
						>
							<Add titleAccess="Add" />
						</IconButton>
					</span>
				</Tooltip>
			</InputLabel>
			{rows.map((item, index) => {
				const key = item.key;
				return (
					<Grid container spacing={2} sx={{ width: "100%" }} key={index}>
						<Grid sx={{ width: "30px", paddingTop: "7px", display: { xs: "none", md: "block" } }}>
							<IconButton aria-label="delete" onClick={() => deletRow(index)} disabled={!gitToken}>
								<Delete titleAccess="Delete" />
							</IconButton>
						</Grid>
						<Grid size={{ xs: 12, md: 3 }}>
							<UniqueTextFieldFieldKey
								object={gitRepoPaths}
								updateRow={updateRowKey}
								currentKey={key}
								index={index}
								disabled={!gitToken}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 8 }}>
							<TextField
								value={gitRepoPaths[key].url}
								fullWidth
								helperText={gitToken ? "" : "Input Token to Update Repos"}
								type="url"
								onChange={(event) => {
									updateUrl(index, event.target.value);
								}}
								disabled={!gitToken}
							/>
						</Grid>
					</Grid>
				);
			})}
		</Box>
	);
};
