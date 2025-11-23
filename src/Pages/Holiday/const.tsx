import { styled, TableRow}  from '@mui/material';

interface DateCellProps {
	date: string;
}
const today = new Date();
export const DateRow = styled(
		TableRow,
		{ shouldForwardProp: (prop) => prop !== 'date'}
	)<DateCellProps>(({ date, theme }) => ({
	...(new Date(date) < today && {
 		 backgroundColor: theme.palette.grey.A400,
	})
}));
