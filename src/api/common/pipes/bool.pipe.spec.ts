import { GoneException, HttpStatus } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { CustomParseBoolPipe } from './bool.pipe';

describe('CustomParseBoolPipe', () => {
	let target: CustomParseBoolPipe;
	beforeEach(() => {
		target = new CustomParseBoolPipe();
	});
	describe('transform', () => {
		describe('When validation passes', () => {
			it('[OK] should return boolean', async () => {
				expect(await target.transform('true')).toBe(true);
				expect(await target.transform(true)).toBe(true);
				expect(await target.transform('false')).toBe(false);
				expect(await target.transform(false)).toBe(false);
				expect(await target.transform('1')).toBe(true);
				expect(await target.transform(1)).toBe(true);
				expect(await target.transform('0')).toBe(false);
				expect(await target.transform(0)).toBe(false);
				expect(await target.transform(undefined)).toBe(false);
				expect(await target.transform(null)).toBe(false);
			});
		});
		describe('When validation fails', () => {
			it('[ERROR] should throw an error in mixin of numbers+letters', async () => {
				await expect(target.transform('123abc')).rejects.toThrowError();
			});
			it('[ERROR] should throw an error in text different than false string', async () => {
				await expect(target.transform('abc')).rejects.toThrowError();
			});
		});
		describe('When validation pipe receives a list of b64 strings, bool, integer', () => {
			it('[OK] should pass the evaluation of the first element of the array', async () => {
				expect(await target.transform(['true'])).toBe(true);
				expect(await target.transform(['false'])).toBe(false);
				expect(await target.transform(['1'])).toBe(true);
				expect(await target.transform(['0'])).toBe(false);
				expect(await target.transform([true, false])).toBe(true);
				expect(await target.transform([false, true])).toBe(false);
				expect(await target.transform([1, 0])).toBe(true);
				expect(await target.transform([0, 1])).toBe(false);
			});
			it('[OK] should return false if a list of empty values was received', async () => {
				expect(await target.transform([])).toBe(false);
				expect(await target.transform(['undefined'])).toBe(false);
				expect(await target.transform(['null'])).toBe(false);
			});
		});

		describe('When try to initiliaze the pipe with options', () => {
			it('[ERROR] should throw error same exception that code passed as options', async () => {
				const target = new CustomParseBoolPipe({
					errorHttpStatusCode: HttpStatus.GONE,
				});

				// validate ex is an exception with status code 410

				// expect(await target.transform('123abc')).toBeInstanceOf(GoneException);
				await expect(target.transform('123abc')).rejects.toEqual(new GoneException('Validation failed (123abc cannot be parsed to boolean)'));
				// .toHaveProperty('status', HttpStatus.GONE);
				await expect(target.transform('123abc')).rejects.toHaveProperty('status', HttpStatus.GONE);

				await expect(target.transform('123abc')).rejects.toThrowError();
				await expect(target.transform('abc')).rejects.toThrowError();
			});
		});
	});
});

// si :www es el framework que usa react para hacer frontend. ssr, front directamente y etc
