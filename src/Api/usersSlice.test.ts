import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import reducer, { fetchUsersAndGroups } from './usersSlice';
import * as usersApi from './users';
import { configureStore } from '@reduxjs/toolkit';
import type { ConfigProps } from './Types';

beforeEach(() => {
	vi.restoreAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

test('usersSlice reducer - initial state', () => {
	const state = reducer(undefined as any, { type: '@@INIT' } as any);
	expect(state.groups).toEqual([]);
	expect(state.users).toEqual({});
	expect(state.loaded).toBeNull();
});

test('fetchUsersAndGroups thunk updates state on fulfilled', async () => {
	const fakeData = {
		groups: ['Devs'],
		users: {
			'1': { id: '1', name: 'John Doe', email: 'john@example.com', icon: null, groups: ['Devs'], vacations: [] },
		},
	};

	vi.spyOn(usersApi, 'getUsersAndGroupsApi').mockResolvedValue(fakeData as any);

	const store = configureStore({
		reducer: {
			usersandgroups: reducer,
		},
	});

	const config = { VACATION_KEY: 'name' } as ConfigProps;

	// Dispatch the thunk and wait for it to finish
	await store.dispatch(fetchUsersAndGroups(config) as any);

	const state = store.getState().usersandgroups;

	expect(state.groups).toEqual(fakeData.groups);
	expect(state.users).toEqual(fakeData.users);
	expect(typeof state.loaded).toBe('number');
	expect(state.loaded).toBeGreaterThan(0);
});
