import holidays from 'date-holidays';
import type {UsersGroupProps} from '@src/Api'

const Calendar: React.FC<{
	possibleUsers: UsersGroupProps,
	users: string[],
	group: string,
}> = ({users}) => {
	const hd = new holidays('US'); // For United States
	const today = new Date();
	const nextyear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
	// Get holidays for a specific year
	const usHolidays = hd.getHolidays(today.getFullYear().toString()).filter(holiday => {
		if (holiday.type === 'public' || holiday.type === 'bank') {
			return (holiday.end >= today);
		}
		return false;
	});
	const nextYearUsHolidays = hd.getHolidays(nextyear.getFullYear().toString()).filter(holiday => {
		if (holiday.type === 'public' || holiday.type === 'bank') {
			return (holiday.start <= nextyear);
		}
		return false;
	});
	const allUsHolidays = [...usHolidays, ...nextYearUsHolidays];
	console.log(allUsHolidays);
	return (
		<>{users}</>
	);
};

export default Calendar;