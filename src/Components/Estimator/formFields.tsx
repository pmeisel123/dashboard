import { TextField, Select, MenuItem, InputLabel} from '@mui/material';
import { useState } from 'react';

const FormFields: React.FC<{
	search: string,
	setSearch: React.Dispatch<React.SetStateAction<string>>,
	defaultEstimate: number,
	setDefaultEstimate: React.Dispatch<React.SetStateAction<number>>
}> = ({search, setSearch, defaultEstimate, setDefaultEstimate}) => {
	const [localSearch, setLocalSearch] = useState<string>(search);
	var values = [...Array(11).keys()];
	return (<>
		<InputLabel id="search">Search</InputLabel>
		<TextField
			id="search"
			value={localSearch}
			onChange={(event) => {
				setLocalSearch(event.target.value);
			}}
			onBlur={() => {
				if (localSearch.match(/ /)) {
					setSearch(localSearch);
				} else {
					setSearch('textfields ~ "' + localSearch + '*"');
				}
			}}
		/>
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