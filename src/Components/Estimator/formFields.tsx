import { TextField, Select, MenuItem, InputLabel, Button} from '@mui/material';
import { useState } from 'react';

const FormFields: React.FC<{
	search: string,
	setSearch: React.Dispatch<React.SetStateAction<string>>,
	defaultEstimate: number,
	setDefaultEstimate: React.Dispatch<React.SetStateAction<number>>
	epic: string,
	setEpic: React.Dispatch<React.SetStateAction<string>>,
}> = ({search, setSearch, defaultEstimate, setDefaultEstimate, epic, setEpic}) => {
	const [localSearch, setLocalSearch] = useState<string>(search);
	const [localEpic, setLocalEpic] = useState<string>(epic);
	var values = [...Array(11).keys()];
	return (<>
		<InputLabel id="search">Search</InputLabel>
		<TextField
			id="search"
			value={localSearch}
			onChange={(event) => {
				setLocalSearch(event.target.value);
			}}
		/>
		<InputLabel id="epic">Epic</InputLabel>
		<TextField
			id="epic"
			value={localEpic}
			onChange={(event) => {
				setLocalEpic(event.target.value);
			}}
		/>
		<br /><br />
		<Button
			variant="contained"
			onClick={() => {
				setEpic(localEpic);
				if (!localSearch) {
					setSearch('');
				} else if (localSearch.match(/[^a-z]/i)) {
					setSearch(localSearch);
				} else {
					setSearch('textfields ~ "' + localSearch + '*"');
				}
			}}
			disabled={search == localSearch && epic == localEpic}
		>
			Search
		</Button>
		<br /><br />
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
	</>);
};
export default FormFields