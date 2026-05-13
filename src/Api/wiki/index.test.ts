import { expect, test } from 'vitest';
import * as wikiIndex from './index';

test('wiki index exports', () => {
	expect(typeof wikiIndex).toBe('object');
});
