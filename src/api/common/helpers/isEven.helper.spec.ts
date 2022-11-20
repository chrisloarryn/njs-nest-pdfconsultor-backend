import { describe, expect, it } from 'vitest';

import { isEven } from './isEven.helper';

describe('pgConfig', () => {
	describe('When configuration is ok', () => {
		it.concurrent('[OK] should be defined', () => {
			expect(isEven).toBeDefined();
		});
	});

	describe('When number is even', () => {
		it.concurrent('[OK] should return true', () => {
			expect(isEven(2)).toBe(true);
		});
	});

	describe('When number is odd', () => {
		it.concurrent('[OK] should return false', () => {
			expect(isEven(3)).toBe(false);
		});
	});
});
