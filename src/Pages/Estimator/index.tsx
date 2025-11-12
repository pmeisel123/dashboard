import { useState, useEffect } from 'react'
import '../../App.css'
import {getTicketsApi} from '../../Api'
import type {TicketProps} from '../../Api'
import {EstimatorTable, FormFields} from '../../Components/Estimator';
import { useSearchParams } from 'react-router-dom';


const defaultDefaultDefaultEstimate = 2;

function EstimatorPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const defaultDefaultEstimate: number = parseInt(searchParams.get('defaultEstimate') || (defaultDefaultDefaultEstimate + ''));
	const defaultSearch: string = searchParams.get('search') || '';
	const [data, setData] = useState<TicketProps[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(defaultDefaultEstimate);
	const [search, setSearch] = useState<string>(defaultSearch);


	var getFunc = function() {
		if (!search) {
			return;
		}
		getTicketsApi(search)
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
	}, [search]);
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
		setSearchParams(newSearchParams);
	}, [search, defaultEstimate]);
	return (
		<>
			<FormFields search={search}
				setSearch={setSearch}
				defaultEstimate={defaultEstimate}
				setDefaultEstimate={setDefaultEstimate}
			/>
			{search && <EstimatorTable data={data} defaultEstimate={defaultEstimate} loading={loading} />}
		</>
	);
}
export default EstimatorPage;