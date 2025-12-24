import { Button, Grid, InputLabel, MenuItem, Select, FormControlLabel, Checkbox } from "@mui/material";
import type { BranchesAndTicket, GitRelease } from "@src/Api";
import type { Dispatch, FC, SetStateAction } from "react";

export const CommitsSelector: FC<{
	repo: string;
	branch1: string;
	branch2: string;
	setRepo: Dispatch<SetStateAction<string>>;
	setBranch1: Dispatch<SetStateAction<string>>;
	setBranch2: Dispatch<SetStateAction<string>>;
	releases: GitRelease[];
	ticketsBranches: BranchesAndTicket;
	useLatestRelease: boolean,
	setUseLatestRelease: Dispatch<SetStateAction<boolean>>;
}> = ({ repo, branch1, branch2, setRepo, setBranch1, setBranch2, releases, ticketsBranches, useLatestRelease, setUseLatestRelease }) => {
	return (
		<Grid container spacing={2} sx={{ paddingBottom: 1 }}>
			<Grid>
				<br />
				<InputLabel id="user">Repo</InputLabel>
				<Select
					label="repo"
					value={repo}
					onChange={(event) => {
						setRepo(event.target.value);
						console.log('here');
						setUseLatestRelease(false);
					}}
				>
					{Object.keys(ticketsBranches.branches).map((value: string) => (
						<MenuItem key={value} value={value}>
							{value}
						</MenuItem>
					))}
				</Select>
			</Grid>
			<Grid>
				<br /><br />
				<FormControlLabel
					control={
						<Checkbox
							checked={useLatestRelease}
							onChange={(event) => {
								setUseLatestRelease(event.target.checked);
							}}
							name="Changes since latest relaese"
							value="Changes since latest relaese"
						/>
					}
					label={(<>Changes since <br />latest relaese</>)}
				/>
			</Grid>
			<Grid>
				Find all commits in
				<InputLabel id="branch1">Branch 1</InputLabel>
				<Select
					label="branch1"
					value={branch1}
					sx={{ minWidth: 300 }}
					onChange={(event) => {
						setBranch1(event.target.value);
						setUseLatestRelease(false);
					}}
				>
					{!!releases.length &&
						releases.reverse().map((release, index) => (
							<MenuItem key={index} value={release.tag.name}>
								release/{release.name} ({release.tag.name})
							</MenuItem>
						))}
					{repo &&
						!!Object.keys(ticketsBranches.branches).length &&
						ticketsBranches.branches[repo].map((value) => (
							<MenuItem key={repo + "__" + value.name} value={value.name}>
								{value.name}
							</MenuItem>
						))}
				</Select>
			</Grid>
			<Grid>
				that are not in
				<InputLabel id="branch1">Branch 2</InputLabel>
				<Select
					label="branch2"
					value={branch2}
					sx={{ minWidth: 300 }}
					onChange={(event) => {
						setBranch2(event.target.value);
						console.log('here');
						setUseLatestRelease(false);
					}}
				>
					{!!releases.length &&
						releases.reverse().map((release, index) => (
							<MenuItem key={index + "--" + release.name} value={release.tag.name}>
								release/{release.name} ({release.tag.name})
							</MenuItem>
						))}
					{repo &&
						!!Object.keys(ticketsBranches.branches).length &&
						ticketsBranches.branches[repo].map((value) => (
							<MenuItem key={repo + "__" + value.name} value={value.name}>
								{value.name}
							</MenuItem>
						))}
				</Select>
			</Grid>
			<Grid>
				&nbsp;
				<InputLabel id="none">&nbsp;</InputLabel>
				<Button
					onClick={() => {
						const orig = branch1; // Technically not needed, but makes me feel better
						setBranch1(branch2);
						setBranch2(orig);
						console.log('here');
						setUseLatestRelease(false);
					}}
				>
					Swap
				</Button>
			</Grid>
		</Grid>
	);
};
