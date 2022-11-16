import { faker } from '@faker-js/faker';
import { isEmpty, isDate } from 'lodash';

import { FakeCreateBankStatementOptions } from '../types';
import { AcquireBankStatementUrl, AcquireWithBase64, BankStatement } from './../../src/api/modules/bank-statement/entities';
import { parseStrToBase64 } from './parseStringToBase64.helper';

export function createBankStatement(options?: FakeCreateBankStatementOptions): BankStatement | AcquireWithBase64 {
	const {
		bsName = '',
		nameLength = 3,
		folio = '',
		folioLength = 10,
		processID = 0,
		processIDLength = 10,
		url = '',
		rut = 0,
		rutLength = 10,
		productID = '',
		productIDLength = 10,
		period = '',
		periodLength = 10,
	} = options || {};
	const bankStatement = new BankStatement();
	bankStatement.setBankStatementName(!isEmpty(bsName) ? bsName : faker.random.words(nameLength));
	bankStatement.setBankStatementFolio(!isEmpty(folio) ? folio : faker.random.alphaNumeric(folioLength));
	bankStatement.setBankStatementProcessID(!isEmpty(processID) ? processID : Number(faker.random.numeric(processIDLength)));
	bankStatement.setBankStatementRut(!isEmpty(rut) ? rut : Number(faker.random.numeric(rutLength)));
	bankStatement.setBankStatementUrl(!isEmpty(url) ? url : faker.internet.url());
	bankStatement.setBankStatementProductID(!isEmpty(productID) ? productID : faker.random.alphaNumeric(productIDLength));
	bankStatement.setBankStatementPeriod(!isEmpty(period) ? period : faker.random.alphaNumeric(periodLength));

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
		date = null,
		dateOccurrence = 'past',
		folio = '',
		folioLength = 10,
		url = '',
		rut = 0,
		rutLength = 10,
		period = '',
		periodLength = 10,
	} = options || {};
	const bankStatement = new AcquireBankStatementUrl();

	bankStatement.car_folio = !isEmpty(folio) ? folio : faker.random.alphaNumeric(folioLength);
	bankStatement.car_periodo = !isEmpty(period) ? period : faker.random.alphaNumeric(periodLength);
	bankStatement.car_rut = !isEmpty(rut) ? rut : Number(faker.random.numeric(rutLength));
	bankStatement.car_url = !isEmpty(url) ? url : faker.internet.url();

	if (!isEmpty(date) && isDate(date)) {
		bankStatement.created_at = date;
	} else if (dateOccurrence === 'future') {
		bankStatement.created_at = faker.date.future();
	} else {
		bankStatement.created_at = faker.date.past();
	}

	return bankStatement;
}
