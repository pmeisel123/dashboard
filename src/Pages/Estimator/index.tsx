import { useState, useEffect } from 'react'
import {getTicketsApi} from '../../Api'
import type {TicketProps} from '../../Api'
import {EstimatorTable, FormFields} from '../../Components/Estimator';
import { useSearchParams } from 'react-router-dom';


const defaultDefaultDefaultEstimate = 2;

function EstimatorPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const defaultDefaultEstimate: number = parseInt(searchParams.get('defaultEstimate') || (defaultDefaultDefaultEstimate + ''));
	const defaultSearch: string = searchParams.get('search') || '';
	const defaultEpic: string = searchParams.get('epic') || '';
	const [data, setData] = useState<TicketProps[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(defaultDefaultEstimate);
	const [search, setSearch] = useState<string>(defaultSearch);
	const [epic, setEpic] = useState<string>(defaultEpic);


	var getFunc = function() {
		var jira_search = '';
		if (search && epic) {
			jira_search = search + ' AND parent=' + epic
		} else if (!search && epic) {
			jira_search = 'parent = ' + epic
		} else {
			jira_search = search
		}
		if (!jira_search) {
			return;
		}
		console.log(search);
		console.log(jira_search);
		getTicketsApi(jira_search)
			.then(data => {
				setLoading(false);
				console.log(data);
				setData(data);
			})
			.catch(error => console.error("Caught error in main:", error));
	};
	useEffect(() => {
		getFunc();
		const intervalId = setInterval(() => {
			getFunc();
		}, 30000);
		return () => clearInterval(intervalId);
	}, [search, epic]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (defaultEstimate != defaultDefaultDefaultEstimate) {
			newSearchParams.set('defaultEstimate', defaultEstimate + '');
		} else {
			newSearchParams.delete('defaultEstimate');
		}
		if (search != '') {
			newSearchParams.set('search', search);
		} else {
			newSearchParams.delete('search');
		}
		if (epic != '') {
			newSearchParams.set('epic', epic);
		} else {
			newSearchParams.delete('epic');
		}
		setSearchParams(newSearchParams);
	}, [search, defaultEstimate, epic]);
	return (
		<>
			<FormFields
				search={search}
				setSearch={setSearch}
				epic={epic}
				setEpic={setEpic}
				defaultEstimate={defaultEstimate}
				setDefaultEstimate={setDefaultEstimate}
			/>
			{(search || epic) && <EstimatorTable data={data} defaultEstimate={defaultEstimate} loading={loading} />}
		</>
	);
}
export default EstimatorPage;