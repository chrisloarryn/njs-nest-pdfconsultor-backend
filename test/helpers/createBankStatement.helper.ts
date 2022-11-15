import { faker } from '@faker-js/faker';

import { AcquireWithBase64, BankStatement } from '@ccla/api/modules/bank-statement/entities';

import { FakeCreateBankStatementOptions } from '../types';
import { parseStrToBase64 } from './parseStringToBase64.helper';

// validate if a string, number or boolean is empty.
function isEmpty(value: any): boolean {
	return !!value;
}

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
