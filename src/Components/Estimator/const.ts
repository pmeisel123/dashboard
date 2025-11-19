import { styled, TableCell}  from '@mui/material';

interface EstimatorCellProps {
	isOff?: boolean;
	isDone?: boolean;
	isPartial?: boolean;
}
export const EstimatorCell = styled(
		TableCell,
		{ shouldForwardProp: (prop) => prop !== 'isOff' && prop !== 'isDone'  && prop !== 'isPartial' }
	)<EstimatorCellProps>(({ isOff , isDone, isPartial }) => ({
	
	...(isDone && {
 		 backgroundColor: '#F88',
	}),
	...(isOff && {
 		 backgroundColor: '#DDD',
	}),
	...(isPartial && {
 		 backgroundColor: '#EEE',
	}),
}));

export const getHolidayDayString = ((dateObj:Date) => {
	let month: (string | number)	= dateObj.getUTCMonth() + 1; // months from 1-12
	let day: (string | number)	= dateObj.getUTCDate();
	const year	= dateObj.getUTCFullYear();

	if (day < 10) {
		day = '0' + day;
	}
	if (month < 10) {
		month = '0' + month;
	}
	return year + "-" + month + "-" + day + " 00:00:00";
});

export const getDateString = ((dateObj: Date) => {
	const month	= dateObj.toLocaleString('default', { month: 'long' });
	const day	= dateObj.getUTCDate();
	const year	= dateObj.getUTCFullYear();
	if (year != new Date().getUTCFullYear()) {
		return month + " " + day + " " + year;
	}
	return month + " " + day;
});