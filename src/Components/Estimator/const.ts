import { styled, TableCell}  from '@mui/material';

interface EstimatorCellProps {
	isOff?: boolean;
	isDone?: boolean;
	isPartial?: boolean;
}

export const EstimatorCell = styled(
		TableCell,
		{ shouldForwardProp: (prop) => prop !== 'isOff' && prop !== 'isDone'  && prop !== 'isPartial' }
	)<EstimatorCellProps>(({ isOff , isDone, isPartial, theme }) => ({
	border: '1px solid',
	verticalAlign: 'top',
	...(isDone && {
		 backgroundColor: theme.palette.success.light,
	}),
	...(isOff && {
		 backgroundColor: theme.palette.grey.A400,
	}),
	...(isPartial && {
		 backgroundColor: theme.palette.grey[300],
	}),
}));
