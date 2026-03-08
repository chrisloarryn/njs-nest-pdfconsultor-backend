import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { map, type Observable, tap } from 'rxjs';
import type { Logger } from 'winston';

import { GetBankStatementsUseCase } from '@/modules/bank-statements/application/use-cases/get-bank-statements.use-case';
import type { BankStatementBase64Summary, BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';
import {
	BankStatementResponseDto,
	BankStatementWithBase64ResponseDto,
	toBankStatementResponseDto,
	toBankStatementWithBase64ResponseDto,
} from '@/modules/bank-statements/presentation/dto/bank-statement-response.dto';
import { CustomParseBoolPipe } from '@/shared/presentation/pipes/custom-parse-bool.pipe';

@ApiTags('Bank Statements')
@Controller('bank-statements')
export class BankStatementsController {
	constructor(
		private readonly getBankStatementsUseCase: GetBankStatementsUseCase,
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	@Get('pdf')
	@ApiOperation({ summary: 'Obtiene cartolas PDF por combinaciones de periodo, rut y folio.' })
	@ApiHeader({ name: 'X-Folio', required: false, description: 'Folio de la cartola.', example: 'FOLIO-001' })
	@ApiHeader({ name: 'X-Period', required: false, description: 'Periodo de la cartola.', example: '202401' })
	@ApiHeader({ name: 'X-Rut', required: false, description: 'Rut del titular.', example: '18.979.569-6' })
	@ApiQuery({ name: 'b64', required: false, type: Boolean, example: false })
	@ApiOkResponse({ type: BankStatementResponseDto, isArray: true })
	getBankStatements(
		@Headers('x-folio') folio: string | undefined,
		@Headers('x-period') period: string | undefined,
		@Headers('x-rut') rut: string | undefined,
		@Query('b64', CustomParseBoolPipe) base64: boolean,
	): Observable<BankStatementResponseDto[] | BankStatementWithBase64ResponseDto[]> {
		this.logger.debug(`getBankStatements period=${period ?? '-'} rut=${rut ?? '-'} folio=${folio ?? '-'} base64=${String(base64)}`);

		return this.getBankStatementsUseCase
			.execute({
				folio,
				options: { base64 },
				period,
				rut,
			})
			.pipe(
				tap((items) => this.logger.debug(`getBankStatements resultCount=${items.length}`)),
				map((items) => this.toResponse(items, base64)),
			);
	}

	private toResponse(
		items: BankStatementSummary[] | BankStatementBase64Summary[],
		base64: boolean,
	): BankStatementResponseDto[] | BankStatementWithBase64ResponseDto[] {
		if (base64) {
			return (items as BankStatementBase64Summary[]).map(toBankStatementWithBase64ResponseDto);
		}

		return (items as BankStatementSummary[]).map(toBankStatementResponseDto);
	}
}
