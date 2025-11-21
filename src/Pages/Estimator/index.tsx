import { useState, useEffect, useRef } from 'react'
import {getTicketsApi, getUsersAndGroupsApi} from '@src/Api'
import type {TicketProps, UsersGroupProps} from '@src/Api'
import {EstimatorTable, FormFields, Calendar} from '@src/Components/Estimator';
import {UserSelectors} from '@src/Components/Users';
import { useSearchParams } from 'react-router-dom';


const defaultDefaultDefaultEstimate = 2;

function EstimatorPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const defaultDefaultEstimate: number = parseInt(searchParams.get('defaultEstimate') || (defaultDefaultDefaultEstimate + ''));
	const defaultParent: string = searchParams.get('parent') || '';
	const [data, setData] = useState<TicketProps[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(defaultDefaultEstimate);
	const [search, setSearch] = useState<string>(searchParams.get('search') || '');
	const [parent, setParent] = useState<string>(defaultParent);
	const [fudgeFactor, setFudgeFactor] = useState<number>(parseFloat(searchParams.get('fudgeFactor') || '0'));
	const [possibleUsersGroups, setPossibleUsersGroups] = useState<UsersGroupProps>({groups: [], users: {}});
	const [group, setGroup] = useState<string>(searchParams.get('group') || '');
	const user_param = searchParams.get('users') || '';
	const [users, setUsers] = useState<Set<string>>(new Set(user_param.split(',')));
	const hasFetchedUser = useRef(false);
	const hasFetchedTickets = useRef('');

	let totalTimEstimate = 0;
	let totalTimeOriginalEstimate = 0;
	let totalTimeSpent = 0;
	var getFunc = function() {
		var jira_search = '';
		if (search && parent) {
			jira_search = search + ' AND parent=' + parent;
		} else if (!search && parent) {
			jira_search = 'parent = ' + parent;
		} else {
			jira_search = search;
		}
		if (!jira_search) {
			return;
		}
		console.log(jira_search);
		getTicketsApi(jira_search)
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
		if ((search || parent) && hasFetchedTickets.current != search + ' -- ' + parent) {
			getFunc();
			hasFetchedTickets.current = search + ' -- ' + parent;
		}
		/*
		const intervalId = setInterval(() => {
			getFunc();
		}, 30000);
		return () => clearInterval(intervalId);
		*/
	}, [search, parent]);
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
		if (parent != '') {
			newSearchParams.set('parent', parent);
		} else {
			newSearchParams.delete('parent');
		}
		if (fudgeFactor != 0) {
			newSearchParams.set('fudgeFactor', fudgeFactor + '');
		} else {
			newSearchParams.delete('fudgeFactor');
		}
		if (group != '') {
			newSearchParams.set('group', group);
		} else {
			newSearchParams.delete('group');
		}
		if (possibleUsersGroups && possibleUsersGroups.users && Object.keys(possibleUsersGroups.users).length)
		if (users.size) {
			newSearchParams.set('users', [...users].join(','));
		} else {
			newSearchParams.delete('users');
		}
		setSearchParams(newSearchParams);
	}, [search, defaultEstimate, parent, fudgeFactor, group, users]);

	totalTimEstimate = data.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0) + fudgeFactor;
	totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0) + fudgeFactor;
	totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			<FormFields
				search={search}
				setSearch={setSearch}
				parent={parent}
				setParent={setParent}
				defaultEstimate={defaultEstimate}
				setDefaultEstimate={setDefaultEstimate}
				fudgeFactor={fudgeFactor}
				setFudgeFactor={setFudgeFactor}
			/>
			<UserSelectors
				possibleUsersGroups={possibleUsersGroups}
				group={group}
				setGroup={setGroup}
				users={users}
				setUsers={setUsers}
			/>
			{
				(search || parent) &&
				<EstimatorTable
					data={data}
					defaultEstimate={defaultEstimate}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
				/>
			}
			{
				((search || parent) && !!data.length) &&
				<Calendar
					users={users}
					group={group}
					possibleUsersGroups={possibleUsersGroups}
					totalTimEstimate={totalTimEstimate}
				/>
			}
		</>
	);
}
export default EstimatorPage;