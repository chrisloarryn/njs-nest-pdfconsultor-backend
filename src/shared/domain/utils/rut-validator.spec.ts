import { describe, expect, it } from 'vitest';

import { RutValidator } from '@/shared/domain/utils/rut-validator';

describe('RutValidator', () => {
	it('returns true for valid rut values', () => {
		expect(RutValidator.isValid('18.979.569-6')).toBe(true);
	});

	it('returns false for invalid rut values', () => {
		expect(RutValidator.isValid('12.345.678-9')).toBe(false);
	});

	it('normalizes valid rut values into digits', () => {
		expect(RutValidator.normalize('18.979.569-6')).toBe(18_979_569);
	});

	it('returns null when trying to normalize an invalid rut', () => {
		expect(RutValidator.normalize('12.345.678-9')).toBeNull();
	});
});
