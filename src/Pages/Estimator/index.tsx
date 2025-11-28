import { useState, useEffect, useRef } from 'react'
import {getTicketsApi, getUsersAndGroupsApi} from '@src/Api'
import type {TicketProps, UsersGroupProps} from '@src/Api'
import {TicketTable, FormFields, Calendar, UsersSelector} from '@src/Components';
import { useSearchParams } from 'react-router-dom';


const defaultDefaultDefaultEstimate = 2;

function EstimatorPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	let defaultDefaultEstimate: number = parseInt(searchParams.get('defaultEstimate') || (defaultDefaultDefaultEstimate + ''));
	const [data, setData] = useState<TicketProps[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [defaultEstimate, setDefaultEstimate] = useState<number>(defaultDefaultEstimate);
	const [search, setSearch] = useState<string>(searchParams.get('search') || '');
	const [parent, setParent] = useState<string>(searchParams.get('parent') || '');
	const [estimatePadding, setEstimatePadding] = useState<number>(parseFloat(searchParams.get('estimatePadding') || '0'));
	const [possibleUsersGroups, setPossibleUsersGroups] = useState<UsersGroupProps>({groups: [], users: {}});
	const [group, setGroup] = useState<string>(searchParams.get('group') || '');
	let user_param = searchParams.get('users') || '';
	const [users, setUsers] = useState<Set<string>>(new Set(user_param.split(',')));
	const hasFetchedUser = useRef(false);
	const hasFetchedTickets = useRef('');
	const freezeParams = useRef(false);


	const loadParams = () => {
		defaultDefaultEstimate = parseInt(searchParams.get('defaultEstimate') || (defaultDefaultDefaultEstimate + ''));
		setDefaultEstimate(defaultDefaultEstimate);
		setSearch(searchParams.get('search') || '');
		setParent(searchParams.get('parent') || '');
		setEstimatePadding(parseFloat(searchParams.get('estimatePadding') || '0'));
		setGroup(searchParams.get('group') || '');
		user_param = searchParams.get('users') || '';
		setUsers(new Set(user_param.split(',')));
	};

	useEffect(() => {
		freezeParams.current = true;
		loadParams();
		setTimeout(function() {
			freezeParams.current = false;
		});
	}, [searchParams]);

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
	}, [search, parent]);
	useEffect(() => {
		if (freezeParams.current) {
			return;
		}
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
		if (estimatePadding != 0) {
			newSearchParams.set('estimatePadding', estimatePadding + '');
		} else {
			newSearchParams.delete('estimatePadding');
		}
		if (group != '') {
			newSearchParams.set('group', group);
		} else {
			newSearchParams.delete('group');
		}
		if (possibleUsersGroups && possibleUsersGroups.users && Object.keys(possibleUsersGroups.users).length) {
			if (users.size) {
				newSearchParams.set('users', [...users].join(','));
			} else {
				newSearchParams.delete('users');
			}
		}

		if(searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [search, defaultEstimate, parent, estimatePadding, group, users]);

	let totalTimEstimate = data.reduce((sum, row) => sum + (row.timeestimate || defaultEstimate), 0) + estimatePadding;
	let totalTimeOriginalEstimate = data.reduce((sum, row) => sum + (row.timeoriginalestimate || defaultEstimate), 0) + estimatePadding;
	let totalTimeSpent = data.reduce((sum, row) => sum + (row.timespent || 0), 0);
	return (
		<>
			<FormFields
				search={search}
				setSearch={setSearch}
				parent={parent}
				setParent={setParent}
				defaultEstimate={defaultEstimate}
				setDefaultEstimate={setDefaultEstimate}
				estimatePadding={estimatePadding}
				setEstimatePadding={setEstimatePadding}
			/>
			<UsersSelector
				possibleUsersGroups={possibleUsersGroups}
				group={group}
				setGroup={setGroup}
				users={users}
				setUsers={setUsers}
			/>
			{
				(search || parent) &&
				<TicketTable
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