import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import * as usersApi from './users';
import * as vacationsModule from './vacations';

beforeEach(() => {
	// Ensure fetch and mocks are reset before each test
	vi.restoreAllMocks();
});

afterEach(() => {
	// Clean up any globals we modified
	delete (global as any).fetch;
});

test('userHasGroup - returns true for empty groups and matching groups', () => {
	const userWithGroups = { groups: ['DevGroup', 'Other'] } as any;
	// empty groups list should allow all users
	expect(usersApi.userHasGroup(userWithGroups, [])).toBe(true);
	// user has matching group
	expect(usersApi.userHasGroup(userWithGroups, ['DevGroup'])).toBe(true);
	// no matching group
	expect(usersApi.userHasGroup(userWithGroups, ['Nope'])).toBe(false);
});

test('getUserGroupApi - filters groups with capitals or spaces and excludes dashed-lowercase defaults', async () => {
	const mockResponse = {
		groups: {
			items: [
				{ name: 'DevGroup' }, // contains capital letter -> included
				{ name: 'team-alpha' }, // dashed lowercase -> excluded
				{ name: 'jira-software-users' }, // dashed lowercase -> excluded
				{ name: 'Admin Team' }, // contains space/capital -> included
				{ name: '' }, // empty name -> excluded
			],
		},
	};

	const fetchMock = vi.fn().mockResolvedValue({ json: async () => mockResponse });
	(global as any).fetch = fetchMock;

	const groups = await usersApi.getUserGroupApi('some-id');

	expect(fetchMock).toHaveBeenCalled();
	expect(groups).toEqual(['DevGroup', 'Admin Team']);
});

test('getUsersAndGroupsApi - aggregates users, groups, and vacations', async () => {
	// Prepare two users returned by the Jira search API
	const user1 = {
		accountType: 'atlassian',
		accountId: '1',
		displayName: 'John Doe',
		emailAddress: 'john@example.com',
		avatarUrls: { '16x16': 'icon1' },
	};
	const user2 = {
		accountType: 'atlassian',
		accountId: '2',
		displayName: 'Jane Smith',
		emailAddress: 'jane@example.com',
		avatarUrls: { '16x16': 'icon2' },
	};

	// Mock fetch for the paginated user search and per-user group calls:
	// 1) users search -> [user1,user2]
	// 2) groups for user1
	// 3) groups for user2
	// 4) next users search -> [] to stop pagination
	const fetchMock = vi
		.fn()
		.mockResolvedValueOnce({ json: async () => [user1, user2] })
		.mockResolvedValueOnce({ json: async () => ({ groups: { items: [{ name: 'Devs' }, { name: 'Common' }, {name: "jira-software-users"}] } }) })
		.mockResolvedValueOnce({ json: async () => ({ groups: { items: [{ name: 'Admins' }, { name: 'Common' }, {name: "jira-software-users"}] } }) })
		.mockResolvedValueOnce({ json: async () => [] });
	(global as any).fetch = fetchMock;

	// Do NOT spy on usersApi.getUserGroupApi because internal calls use the module-local reference; instead mock fetch as above

	// Mock getVacationApi to return vacations keyed by display name
	vi.spyOn(vacationsModule, 'getVacationApi').mockResolvedValue({
		'John Doe': ['2026-12-25'],
		'Unknown Smith': ['2026-01-01'],
	});

	const config = { VACATION_KEY: 'name' } as any;
	const result = await usersApi.getUsersAndGroupsApi(config);

	// Validate groups array contains unique grouped names
	expect(result.groups.sort()).toEqual(['Admins', 'Common', 'Devs'].sort());

	// Validate users map contains both users keyed by accountId
	expect(Object.keys(result.users).sort()).toEqual(['1', '2'].sort());

	const formatted1 = result.users['1'];
	expect(formatted1.name).toBe('John Doe');
	expect(formatted1.email).toBe('john@example.com');
	expect(formatted1.icon).toBe('icon1');
	expect(formatted1.groups).toEqual(['Devs', 'Common']);
	expect(formatted1.vacations).toEqual(['2026-12-25']);

	const formatted2 = result.users['2'];
	expect(formatted2.name).toBe('Jane Smith');
	expect(formatted2.email).toBe('jane@example.com');
	expect(formatted2.icon).toBe('icon2');
	expect(formatted2.groups).toEqual(['Admins', 'Common']);
	expect(formatted2.vacations).toEqual([]);
});
