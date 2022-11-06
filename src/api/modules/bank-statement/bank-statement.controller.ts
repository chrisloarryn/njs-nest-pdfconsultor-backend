import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

import { BankStatementService } from '@ccla/api/modules/bank-statement/bank-statement.service';
import { AcquireBankStatementUrl, AcquireWithBase64 } from '@ccla/api/modules/bank-statement/entities';

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
	// add query params base64
	@Get(':processId/:folio')
	@ApiParam({ name: 'processId', type: 'number' })
	@ApiParam({ name: 'folio', type: 'string' })
	@ApiQuery({ name: 'b64', required: false, type: Boolean, allowEmptyValue: true })
	getBankStatementByProcessIdAndFolio(
		@Param('processId') processId: number,
		@Param('folio') folio: string,
		@Query('b64') base64: boolean,
	): Observable<AcquireWithBase64 | AcquireBankStatementUrl> {
		this.logger.info(`method: getBankStatementByProcessIdAndFolio, req:${processId}, ${folio}`);
		const bankStatement = this.bankStatementService.getBankStatementByProcessIdAndFolio(processId, folio, { base64 });
		bankStatement.subscribe((bankStatement) => {
			this.logger.info(`response:${JSON.stringify(bankStatement)}`);
		});
		return bankStatement;
	}
}
