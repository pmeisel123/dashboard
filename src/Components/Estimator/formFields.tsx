import { TextField, Select, MenuItem, InputLabel, Button, Grid} from '@mui/material';
import { useState, useEffect } from 'react';

const FormFields: React.FC<{
	search: string,
	setSearch: React.Dispatch<React.SetStateAction<string>>,
	defaultEstimate: number,
	setDefaultEstimate: React.Dispatch<React.SetStateAction<number>>
	parent: string,
	setParent: React.Dispatch<React.SetStateAction<string>>,
	fudgeFactor: number,
	setFudgeFactor: React.Dispatch<React.SetStateAction<number>>,
}> = ({search, setSearch, defaultEstimate, setDefaultEstimate, parent, setParent, fudgeFactor, setFudgeFactor}) => {
	const [localSearch, setLocalSearch] = useState<string>(search);
	const [localParent, setLocalParent] = useState<string>(parent);
	useEffect(() => {
		setLocalSearch(search);
		setLocalParent(parent);
	}, [search, parent]);
	var values = [...Array(11).keys()];
	var fudgeSteps =  [...Array(16).keys()];
	fudgeSteps = fudgeSteps.concat(Array.from({ length: 9 }, (_, index) => (5 * index) + 20));
	return (<>
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
			<Grid  size={{ xs: 12, md: 3 }}>
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
							setSearch('');
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
					value={defaultEstimate + ''}
					onChange={(event) => {
						setDefaultEstimate(parseInt(event.target.value));
					}}
					inputProps={{ 'aria-label': 'Number dropdown' }}
				>
					{values.map((value) => (
						<MenuItem key={value} value={value}>
							{value}
						</MenuItem>
					))}
				</Select>
			</Grid>
			<Grid size={{ xs: 12, md: 3 }}>
				<InputLabel id="fudgeFactor">Fudge Factor</InputLabel>
				<Select
					labelId="fudgeFactor"
					value={fudgeFactor + ''}
					onChange={(event) => {
						setFudgeFactor(parseFloat(event.target.value));
					}}
					inputProps={{ 'aria-label': 'Number dropdown' }}
				>
					{fudgeSteps.map((value) => (
						<MenuItem key={value} value={value}>
							{value}
						</MenuItem>
					))}
				</Select>
			</Grid>
		</Grid>
	</>);
};
export default FormFields