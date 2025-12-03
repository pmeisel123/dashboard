import {Box} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

declare const __DUCKS__: string[];
const max_silly = 51;

export const Duck = () => {
	const [searchParams] = useSearchParams();
	const [duck, setDuck] = useState<string>('ducky.png');
	const [silly, setSilly] = useState<number>(parseInt(searchParams.get('silly') || (max_silly + '')));
	let duck_name = duck.replace(/\..*/, '');

	const randomSilly = () => {
		if (searchParams.get('silly') != null) {
			setSilly(parseInt(searchParams.get('silly') || (max_silly + '')));
		} else {
			setSilly(Math.floor(Math.random() * max_silly));
		}
	};
	useEffect(() => {
		randomSilly();
		const duckInterval = setInterval(() => {
			randomSilly();
		}, 10000);
		return () => {
			clearInterval(duckInterval);
		}; 
	}, []);

	useEffect(() => {
		console.log(silly, __DUCKS__.length)
		if (__DUCKS__.length > silly && __DUCKS__[silly]) {
			setDuck(__DUCKS__[silly])
		} else {
			setDuck('ducky.png');
		}
		duck_name = duck.replace(/\..*/, '');
	}, [silly]);

	return (
		<Box sx={{position: 'fixed', bottom: '10px', right: '10px'}}  title={silly + ' ' + duck_name} key={silly}>
			<img style={{height: '60px', width: '60px'}} src={'/src/assets/ducks/' + duck} />
		</Box>
	);
};
