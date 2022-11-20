import { faker } from '@faker-js/faker';
import { isEmpty, isDate, isNumber } from 'lodash';

import { AcquireBankStatementUrl, AcquireWithBase64, BankStatement } from './../../modules/bank-statement/entities';
import { FakeCreateBankStatementOptions } from './../types/create.type';
import { parseStrToBase64 } from './parseStringToBase64.helper';

export function createBankStatement(options?: FakeCreateBankStatementOptions): BankStatement | AcquireWithBase64 {
	const {
		bsName = '',
		nameLength = 3,
		folio = '',
		folioLength = 10,
		processID = undefined,
		processIDLength = 10,
		url = '',
		rut = undefined,
		rutLength = 10,
		productID = '',
		productIDLength = 10,
		period = '',
		periodLength = 10,
	} = options as FakeCreateBankStatementOptions;
	const bankStatement = new BankStatement();
	bankStatement.setBankStatementName(isEmpty(bsName) ? faker.random.words(nameLength) : bsName);
	bankStatement.setBankStatementFolio(isEmpty(folio) ? faker.random.alphaNumeric(folioLength) : folio);
	bankStatement.setBankStatementProcessID(!isNumber(processID) ? Number(faker.random.numeric(processIDLength)) : processID);
	// TODO: rut should be string
	bankStatement.setBankStatementRut(isNumber(rut) ? rut : Number(faker.random.numeric(rutLength)));
	bankStatement.setBankStatementUrl(isEmpty(url) ? faker.internet.url() : url);
	bankStatement.setBankStatementProductID(isEmpty(productID) ? faker.random.alphaNumeric(productIDLength) : productID);
	bankStatement.setBankStatementPeriod(isEmpty(period) ? faker.random.alphaNumeric(periodLength) : period);

	if (options?.base64) {
		const base64 = parseStrToBase64(bankStatement.car_url);

		const bs = bankStatement as AcquireWithBase64;

		bs.base64 = base64;

		return bs;
	}

	return bankStatement;
}

export type FakeCreateBSRepoOptions = {
	date?: Date;
	dateOccurrence?: 'past' | 'future';
	folio?: string;
	folioLength?: number;
	processID?: number;
	processIDLength?: number;
	rut?: number;
	rutLength?: number;
	url?: string;
	productID?: string;
	productIDLength?: number;
	period?: string;
	periodLength?: number;
	base64?: boolean;
};
export function createRepoBS(options?: FakeCreateBSRepoOptions): AcquireBankStatementUrl {
	const {
		date = undefined,
		dateOccurrence = 'past',
		folio = '',
		folioLength = 10,
		url = '',
		rut = undefined,
		rutLength = 10,
		period = '',
		periodLength = 10,
	} = options as FakeCreateBSRepoOptions;

	const bankStatement = new AcquireBankStatementUrl();

	bankStatement.car_folio = isEmpty(folio) ? faker.random.alphaNumeric(folioLength) : folio;
	bankStatement.car_periodo = isEmpty(period) ? faker.random.alphaNumeric(periodLength) : period;
	// TODO: rut should be string
	bankStatement.car_rut = isNumber(rut) ? rut : Number(faker.random.numeric(rutLength));
	bankStatement.car_url = isEmpty(url) ? faker.internet.url() : url;

	if (isDate(date)) {
		bankStatement.created_at = date;
	} else if (dateOccurrence === 'future') {
		bankStatement.created_at = faker.date.future();
	} else {
		bankStatement.created_at = faker.date.past();
	}

	return bankStatement;
}
