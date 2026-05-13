import { expect, test, describe } from 'vitest';

// Runtime type guards for testing shapes defined in src/Api/Types
const isUser = (obj: any): boolean => {
	return !!(
		obj &&
		typeof obj.id === 'string' &&
		(typeof obj.icon === 'string' || obj.icon === null) &&
		typeof obj.name === 'string' &&
		(typeof obj.email === 'string' || obj.email === null) &&
		(Array.isArray(obj.groups) || obj.groups === null) &&
		(Array.isArray(obj.vacations) || obj.vacations === null)
	);
};

const isUsersGroup = (obj: any): boolean => {
	return !!(obj && Array.isArray(obj.groups) && obj.users && typeof obj.users === 'object');
};

const isWikiPage = (obj: any): boolean => {
	return !!(obj && typeof obj.title === 'string' && typeof obj.body === 'string');
};

const isWikiPageEntry = (obj: any): boolean => {
	return !!(obj && typeof obj.id === 'string' && typeof obj.title === 'string');
};

const isGitBranch = (obj: any): boolean => {
	return !!(
		obj &&
		typeof obj.name === 'string' &&
		obj.commit &&
		typeof obj.commit.sha === 'string' &&
		typeof obj.commit.url === 'string'
	);
};

const isTicket = (obj: any): boolean => {
	return !!(
		obj &&
		typeof obj.id === 'number' &&
		typeof obj.key === 'string' &&
		typeof obj.isdone === 'boolean' &&
		(obj.customFields === undefined || typeof obj.customFields === 'object') &&
		(obj.labels === null || Array.isArray(obj.labels))
	);
};

describe('Types runtime shape tests', () => {
	test('UserProps valid/invalid', () => {
		const valid = {
			id: '1',
			icon: null,
			name: 'John',
			email: 'john@example.com',
			groups: ['A'],
			vacations: null,
		};
		const invalid = { name: 'No id' };
		expect(isUser(valid)).toBe(true);
		expect(isUser(invalid)).toBe(false);
	});

	test('UsersGroupProps valid/invalid', () => {
		const valid = { groups: ['G'], users: { '1': { id: '1', icon: null, name: 'X', email: null, groups: [], vacations: [] } } };
		const invalid = { groups: 'not-an-array' };
		expect(isUsersGroup(valid)).toBe(true);
		expect(isUsersGroup(invalid)).toBe(false);
	});

	test('Wiki types', () => {
		const page = { title: 'T', body: 'B' };
		const pageEntry = { id: '1', title: 'T' };
		expect(isWikiPage(page)).toBe(true);
		expect(isWikiPageEntry(pageEntry)).toBe(true);
		expect(isWikiPage({})).toBe(false);
	});

	test('Git branch and ticket shapes', () => {
		const branch = { name: 'b', commit: { sha: 's', url: 'u' } };
		const badBranch = { name: 'b', commit: { url: 'u' } };
		expect(isGitBranch(branch)).toBe(true);
		expect(isGitBranch(badBranch)).toBe(false);

		const ticket = { id: 1, key: 'KEY-1', isdone: false, customFields: {}, labels: null };
		const badTicket = { id: 'no', key: 2 };
		expect(isTicket(ticket)).toBe(true);
		expect(isTicket(badTicket)).toBe(false);
	});
});
