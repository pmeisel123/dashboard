import { expect, test } from 'vitest';
import reducer from './wikiSpacesSlice';

test('wikiSpacesSlice reducer exists', () => {
	const state = reducer(undefined as any, { type: '@@INIT' } as any);
	expect(state).toBeDefined();
});
