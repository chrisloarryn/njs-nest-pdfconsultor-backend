import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

import { CustomParseBoolPipe } from './../../../common/pipes/bool.pipe';
import { AcquireBankStatementUrl, AcquireWithBase64 } from './../../../modules/bank-statement/entities';
import { BankStatementService } from './../../../modules/bank-statement/service/bank-statement.service';

@ApiTags('BankStatement Postgresql')
@Controller('bank-statements')
export class BankStatementController {
	constructor(
		private readonly bankStatementService: BankStatementService,
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	@ApiOperation({ summary: 'Get BankStatement by processId and folio' })
	@ApiCreatedResponse({ description: 'Acquire the bank statement url' })
	@Get('/pdf')
	@ApiHeader({ name: 'folio', description: 'Folio of the bank statement' })
	@ApiHeader({ name: 'period', description: 'Period of the bank statement' })
	@ApiHeader({ name: 'rut', description: 'Rut of the bank statement' })
	@ApiQuery({ name: 'b64', required: false, type: Boolean, allowEmptyValue: true })
	getBankStatementByProcessIdAndFolio(
		@Headers('X-Folio') folio: string,
		@Headers('X-Period') period: string,
		@Headers('X-Rut') rut: string,
		@Query('b64', CustomParseBoolPipe) base64: boolean,
	): Observable<AcquireWithBase64[] | AcquireBankStatementUrl[]> {
		this.logger.debug(`method: getBankStatementByProcessIdAndFolio, req:${period}, ${rut}, ${folio}, ${base64}`);
		const bankStatements = this.bankStatementService.getBankStatementsByPeriodRutAndFolio({
			period,
			rut,
			folio,
			options: { base64 },
		});
		bankStatements.subscribe((bankStatements) => {
			this.logger.debug(`response:${JSON.stringify(bankStatements)}`);
		});
		return bankStatements;
	}
}
