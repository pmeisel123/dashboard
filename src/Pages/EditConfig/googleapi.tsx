import { Add, Delete, Info } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, InputAdornment, InputLabel, Link, TextField } from "@mui/material";
import { HtmlTooltip } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect } from "react";

export const EditGoogleGeminiConfigTab: FC<{
	geminiApiKeys: string[];
	setGeminiApiKeys: Dispatch<SetStateAction<string[]>>;
	editGeminiApiKeys: boolean;
	setEditGeminiApiKeys: Dispatch<SetStateAction<boolean>>;
}> = ({ geminiApiKeys, setGeminiApiKeys, editGeminiApiKeys, setEditGeminiApiKeys }) => {
	useEffect(() => {
		if (!geminiApiKeys || geminiApiKeys.length === 0) {
			addRow();
		}
	}, [geminiApiKeys]);

	const rowChange = (index: number, value: string) => {
		const updatedKeys = [...geminiApiKeys];
		updatedKeys[index] = value;
		setGeminiApiKeys(updatedKeys);
	};
	const addRow = () => {
		setGeminiApiKeys([...geminiApiKeys, ""]);
	};
	const removeRow = (index: number) => {
		const updatedKeys = [...geminiApiKeys];
		updatedKeys.splice(index, 1);
		setGeminiApiKeys(updatedKeys);
	};
	return (
		<Box sx={{ width: "100%" }}>
			<InputLabel id="api_key">Google Gemini Api Key</InputLabel>
			{!editGeminiApiKeys && (
				<Grid container spacing={2} sx={{ width: "100%" }}>
					<Grid sx={{ width: "325px" }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setEditGeminiApiKeys(true);
							}}
						>
							Override current Google Gemini Api Key
						</Button>
					</Grid>
					<Grid size={{ xs: 12, md: 5 }}>
						An Existing Api Key already exists
						<br />
						<Link href="https://aistudio.google.com/api-keys" target="_blank">
							Google Gemini Api Keys
						</Link>
					</Grid>
				</Grid>
			)}
			{editGeminiApiKeys && (
				<>
					<IconButton edge="end" aria-label="delete" onClick={() => addRow()}>
						<Add titleAccess="Add" />
					</IconButton>
					(Multiple keys can be added, each key will be used in a round-robin manner for requests)
					{geminiApiKeys.map((key, index) => (
						<Grid container spacing={2} sx={{ width: "100%" }} key={index}>
							<Grid size={{ xs: 1 }} sx={{ paddingTop: "7px", maxWidth: "30px" }}>
								<IconButton edge="end" aria-label="delete" onClick={() => removeRow(index)}>
									<Delete titleAccess="Delete" />
								</IconButton>
							</Grid>
							<Grid size={{ xs: 12, md: 11 }}>
								<TextField
									id="api_key"
									value={key}
									onChange={(event) => {
										rowChange(index, event.target.value);
									}}
									fullWidth
									helperText=" "
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<HtmlTooltip
													title={
														<>
															Input your Google Gemini Api Key here
															<br />
															<Link
																href="https://aistudio.google.com/api-keys"
																target="_blank"
															>
																Google Gemini Api Key
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
							</Grid>
						</Grid>
					))}
				</>
			)}
		</Box>
	);
};
