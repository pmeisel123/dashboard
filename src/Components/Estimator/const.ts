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
	border: '1px solid',
	verticalAlign: 'top',
	...(isDone && {
		 backgroundColor: '#8F8',
	}),
	...(isOff && {
		 backgroundColor: '#DDD',
	}),
	...(isPartial && {
		 backgroundColor: '#EEE',
	}),
}));
