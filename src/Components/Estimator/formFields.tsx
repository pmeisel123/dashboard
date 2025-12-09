import { Button, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect, useState } from "react";

const FormFields: FC<{
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
	defaultEstimate: number;
	setDefaultEstimate: Dispatch<SetStateAction<number>>;
	parent: string;
	setParent: Dispatch<SetStateAction<string>>;
	estimatePadding: number;
	setEstimatePadding: Dispatch<SetStateAction<number>>;
}> = ({
	search,
	setSearch,
	defaultEstimate,
	setDefaultEstimate,
	parent,
	setParent,
	estimatePadding,
	setEstimatePadding,
}) => {
	const [localSearch, setLocalSearch] = useState<string>(search);
	const [localParent, setLocalParent] = useState<string>(parent);
	useEffect(() => {
		setLocalSearch(search);
		setLocalParent(parent);
	}, [search, parent]);
	var values = [...Array(11).keys()];
	var estimateSteps = [...Array(16).keys()];
	estimateSteps = estimateSteps.concat(Array.from({ length: 9 }, (_, index) => 5 * index + 20));
	return (
		<>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel id="search">Search</InputLabel>
					<TextField
						id="search"
						value={localSearch}
						onChange={(event) => {
							setLocalSearch(event.target.value);
						}}
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel id="parent">Parent Ticket ID</InputLabel>
					<TextField
						id="parent"
						value={localParent}
						onChange={(event) => {
							setLocalParent(event.target.value);
						}}
					/>
				</Grid>
				<Grid size={2}>
					<InputLabel id="parent">&nbsp;</InputLabel>
					<Button
						variant="contained"
						onClick={() => {
							setParent(localParent);
							if (!localSearch) {
								setSearch("");
							} else if (localSearch.match(/[^a-z]/i)) {
								setSearch(localSearch);
							} else {
								setSearch('textfields ~ "' + localSearch + '*"');
							}
						}}
						disabled={search == localSearch && parent == localParent}
					>
						Update
					</Button>
				</Grid>
			</Grid>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel id="default_estimate">Default Estimate</InputLabel>
					<Select
						labelId="default_estimate"
						value={defaultEstimate + ""}
						onChange={(event) => {
							setDefaultEstimate(parseInt(event.target.value));
						}}
						inputProps={{
							"aria-label": "Number dropdown",
						}}
					>
						{values.map((value) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</Select>
				</Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<InputLabel id="estimatePadding">Estimate Padding</InputLabel>
					<Select
						labelId="estimatePadding"
						value={estimatePadding + ""}
						onChange={(event) => {
							setEstimatePadding(parseFloat(event.target.value));
						}}
						inputProps={{
							"aria-label": "Number dropdown",
						}}
					>
						{estimateSteps.map((value) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</Select>
				</Grid>
			</Grid>
		</>
	);
};
export default FormFields;
