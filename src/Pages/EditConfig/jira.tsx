import { Add, Delete, Info } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, InputAdornment, InputLabel, Link, TextField } from "@mui/material";
import type { CustomFieldsObjectProps } from "@src/Api/Types";
import { HtmlTooltip, JiraCustomFields } from "@src/Components";
import type { ChangeEvent, Dispatch, FC, SetStateAction } from "react";

export const EditJiraConfigTab: FC<{
	apiKey: string;
	setApiKey: Dispatch<SetStateAction<string>>;
	apiUrl: string;
	setApiUrl: Dispatch<SetStateAction<string>>;
	apiConfluenceUrl: string;
	setApiConfluenceUrl: Dispatch<SetStateAction<string>>;
	userName: string;
	setUserName: Dispatch<SetStateAction<string>>;
	doneStatus: string[];
	setDoneStaus: Dispatch<SetStateAction<string[]>>;
	customFields: CustomFieldsObjectProps;
	setCustomFields: Dispatch<SetStateAction<CustomFieldsObjectProps>>;
	editApiKey: boolean;
	setEditApiKey: Dispatch<SetStateAction<boolean>>;
}> = ({
	apiKey,
	setApiKey,
	apiUrl,
	setApiUrl,
	apiConfluenceUrl,
	setApiConfluenceUrl,
	userName,
	setUserName,
	doneStatus,
	setDoneStaus,
	customFields,
	setCustomFields,
	editApiKey,
	setEditApiKey,
}) => {
	const handleEditDoneStatus = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
		const newItems = doneStatus.map((item, i) => {
			if (i === index) {
				return event.target.value;
			}
			return item;
		});
		setDoneStaus(newItems);
	};
	const handleDeleteDoneStatus = (index: number) => {
		const newItems = doneStatus.filter((_, i) => i !== index);
		setDoneStaus(newItems);
	};
	const handleAddDoneStatus = () => {
		setDoneStaus([...doneStatus, ""]);
	};
	return (
		<Box sx={{ width: "100%" }}>
			<InputLabel id="api_key">Api Key</InputLabel>
			{!editApiKey && (
				<Grid container spacing={2} sx={{ width: "100%" }}>
					<Grid sx={{ width: "325px" }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setEditApiKey(true);
							}}
						>
							Override current API key and name
						</Button>
					</Grid>
					<Grid size={{ xs: 12, md: 5 }}>
						An Existing API key already exists
						<br />
						<Link href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">
							Jira Api tokens
						</Link>
					</Grid>
				</Grid>
			)}
			{editApiKey && (
				<TextField
					id="api_key"
					value={apiKey}
					onChange={(event) => {
						setApiKey(event.target.value);
					}}
					fullWidth
					helperText=" "
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<HtmlTooltip
									title={
										<>
											Input your Jira API key here
											<br />
											<Link
												href="https://id.atlassian.com/manage-profile/security/api-tokens"
												target="_blank"
											>
												Jira Api tokens
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
			<InputLabel id="username">User Name</InputLabel>
			{!editApiKey && (
				<Grid container spacing={2}>
					<Grid sx={{ width: "325px" }}></Grid>
					<Grid size={{ xs: 12, md: 2 }} sx={{ padding: "10px 0" }}>
						An Existing API User Name already exists
					</Grid>
				</Grid>
			)}
			{editApiKey && (
				<TextField
					id="username"
					value={userName}
					onChange={(event) => {
						setUserName(event.target.value);
					}}
					helperText=" "
					fullWidth
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<HtmlTooltip
									title={<>Input your Jira Username key here</>}
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
			<InputLabel id="ApiUrl">Api Url</InputLabel>
			<TextField
				id="ApiUrl"
				value={apiUrl}
				placeholder="https://pmeisel.atlassian.net/"
				fullWidth
				disabled={!apiKey || !userName}
				helperText={!apiKey || !userName ? "Enter Api Key and username to update" : " "}
				onChange={(event) => {
					setApiUrl(event.target.value);
				}}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<HtmlTooltip
								title={
									<>
										Input your Jira API url here
										<br />
										Example: https://pmeisel.atlassian.net/
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
			<InputLabel id="ApiConfluenceUrl">Api Confluence Url</InputLabel>
			<TextField
				id="ApiConfluenceUrl"
				value={apiConfluenceUrl}
				fullWidth
				placeholder="https://pmeisel.atlassian.net/wiki/"
				disabled={!apiKey || !userName}
				helperText={!apiKey || !userName ? "Enter Api Key and username to update" : " "}
				onChange={(event) => {
					setApiConfluenceUrl(event.target.value);
				}}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<HtmlTooltip
								title={
									<>
										Input your Jira Confluience API url here
										<br />
										Example: https://pmeisel.atlassian.net/wiki/
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
			<InputLabel id="DoneStatus">
				Done Status
				<IconButton edge="end" aria-label="delete" onClick={() => handleAddDoneStatus()}>
					<Add titleAccess="Add" />
				</IconButton>
			</InputLabel>
			<Grid container spacing={1}>
				{doneStatus.map((doneStatus, index) => (
					<Grid size={{ xs: 12, sm: 6, md: 2, lg: 1.5 }} key={index}>
						<TextField
							fullWidth
							helperText=" "
							key={index}
							value={doneStatus}
							onChange={(e) => handleEditDoneStatus(e, index)}
							InputProps={{
								endAdornment: (
									<IconButton
										edge="end"
										aria-label="delete"
										onClick={() => handleDeleteDoneStatus(index)}
									>
										<Delete titleAccess="Delete" />
									</IconButton>
								),
							}}
						/>
					</Grid>
				))}
			</Grid>
			<JiraCustomFields customFields={customFields} setCustomFields={setCustomFields} />
		</Box>
	);
};
