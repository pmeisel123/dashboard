import { useState, useEffect } from 'react'
import {getTicketsApi, getUsersAndGroupsApi} from '@src/Api'
import type {TicketProps, UsersGroupProps} from '@src/Api'
import {EstimatorTable, FormFields, Calendar} from '@src/Components/Estimator';
import {UserSelectors} from '@src/Components/Users';
import { useSearchParams } from 'react-router-dom';


const defaultDefaultDefaultEstimate = 2;

function EstimatorPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const defaultDefaultEstimate: number = parseInt(searchParams.get('defaultEstimate') || (defaultDefaultDefaultEstimate + ''));
	const defaultEpic: string = searchParams.get('epic') || '';
	const [data, setData] = useState<TicketProps[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(defaultDefaultEstimate);
	const [search, setSearch] = useState<string>(searchParams.get('search') || '');
	const [epic, setEpic] = useState<string>(defaultEpic);
	const [fudgeFactor, setFudgeFactor] = useState<number>(parseFloat(searchParams.get('fudgeFactor') || '0'));
	const [possibleUsersGroups, setPossibleUsersGroups] = useState<UsersGroupProps>({groups: [], users: {}});
	const [group, setGroup] = useState<string>(searchParams.get('group') || '');
	const user_param = searchParams.get('users') || '';
	const [users, setUsers] = useState<Set<string>>(new Set(user_param.split(',')));

	let totalTimEstimate = 0;
	let totalTimeOriginalEstimate = 0;
	let totalTimeSpent = 0;
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
		getUsers();
	}, []);
	useEffect(() => {
		getFunc();
		/*
		const intervalId = setInterval(() => {
			getFunc();
		}, 30000);
		return () => clearInterval(intervalId);
		*/
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
		if (users.size) {
			newSearchParams.set('users', [...users].join(','));
		} else {
			newSearchParams.delete('users');
		}
		setSearchParams(newSearchParams);
	}, [search, defaultEstimate, epic, fudgeFactor, group, users]);

	totalTimEstimate = data.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0) + fudgeFactor;
	totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0) + fudgeFactor;
	totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			<FormFields
				search={search}
				setSearch={setSearch}
				epic={epic}
				setEpic={setEpic}
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
				(search || epic) &&
				<EstimatorTable
					data={data}
					defaultEstimate={defaultEstimate}
					loading={loading}
					totalTimEstimate={totalTimEstimate}
					totalTimeOriginalEstimate={totalTimeOriginalEstimate}
					totalTimeSpent={totalTimeSpent}
				/>
			}
			<Calendar
				users={users}
				group={group}
				possibleUsersGroups={possibleUsersGroups}
				totalTimEstimate={totalTimEstimate}
				totalTimeOriginalEstimate={totalTimeOriginalEstimate}
				totalTimeSpent={totalTimeSpent}
			/>
		</>
	);
}
export default EstimatorPage;