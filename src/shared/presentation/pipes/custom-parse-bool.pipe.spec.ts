import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { CustomParseBoolPipe } from '@/shared/presentation/pipes/custom-parse-bool.pipe';

describe('CustomParseBoolPipe', () => {
	const pipe = new CustomParseBoolPipe();

	it('returns false for undefined values', () => {
		expect(pipe.transform(undefined)).toBe(false);
	});

	it('returns true for truthy values', () => {
		expect(pipe.transform('true')).toBe(true);
		expect(pipe.transform('1')).toBe(true);
	});

	it('returns false for falsey values', () => {
		expect(pipe.transform('false')).toBe(false);
		expect(pipe.transform('0')).toBe(false);
	});

	it('throws for invalid values', () => {
		expect(() => pipe.transform('hola')).toThrow(BadRequestException);
	});
});
