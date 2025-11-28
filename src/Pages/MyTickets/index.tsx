import { useState, useEffect, useRef } from 'react'
import {getTicketsApi, getUsersAndGroupsApi} from '@src/Api'
import type {TicketProps, UsersGroupProps} from '@src/Api'
import {TicketTable, UserSelector} from '@src/Components';
import { useSearchParams } from 'react-router-dom';

declare const __DONE_STATUS__: string[];



function MyTicketsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [possibleUsersGroups, setPossibleUsersGroups] = useState<UsersGroupProps>({groups: [], users: {}});
	const [group, setGroup] = useState<string>(searchParams.get('group') || window.localStorage.getItem('group') || '');
	const [user, setUser] = useState<string>(searchParams.get('user') || window.localStorage.getItem('user') || '');
	const [loading, setLoading] = useState<boolean>(true);
	const [data, setData] = useState<TicketProps[]>([]);
	const hasFetchedUser = useRef(false);
	const hasFetchedTickets = useRef('');

	const loadParams = () => {
		setGroup(searchParams.get('group') || window.localStorage.getItem('group') || '');
		setUser(searchParams.get('user') || window.localStorage.getItem('user') || '');
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);

	var getFunc = function() {
		if (!user) {
			setData([])
		}
		getTicketsApi("assignee = " + user + ' AND status NOT IN ("' + __DONE_STATUS__.join('","') + '")' )
			.then((data: TicketProps[]) => {
				setLoading(false);
				setData(data);
			})
	};
	var getUsers = function() {
		getUsersAndGroupsApi().then((data: UsersGroupProps) => {
			setPossibleUsersGroups(data);
		});
	};
	useEffect(() => {
		if (!hasFetchedUser.current) {
			getUsers();
			hasFetchedUser.current = true;
		}
	}, []);
	useEffect(() => {
		if ((user) && hasFetchedTickets.current != user) {
			getFunc();
			hasFetchedTickets.current = user;
		}
	}, [user]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (
			group == window.localStorage.getItem('group') &&
			user == window.localStorage.getItem('user')
		) {
			return;
		}
		if (group != '') {
			newSearchParams.set('group', group);
		} else {
			newSearchParams.delete('group');
		}
		window.localStorage.setItem('group', group);
		if (user != '') {
			newSearchParams.set('user', user);
		} else {
			newSearchParams.delete('user');
		}
		window.localStorage.setItem('user', user);
		if(searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [group, user]);
	let totalTimEstimate = data.reduce((sum, row) => sum + (row.timeestimate || 0), 0);
	let totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || 0), 0);
	let totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			<UserSelector
				possibleUsersGroups={possibleUsersGroups}
				group={group}
				setGroup={setGroup}
				user={user}
				setUser={setUser}
			/>
			{
				(user) &&
				<TicketTable
					data={data}
					defaultEstimate={null}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
				/>
			}
		</>
	);
}

export default MyTicketsPage;