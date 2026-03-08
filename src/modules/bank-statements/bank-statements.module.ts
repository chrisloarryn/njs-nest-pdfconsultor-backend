import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetBankStatementsUseCase } from '@/modules/bank-statements/application/use-cases/get-bank-statements.use-case';
import { BANK_STATEMENT_REPOSITORY } from '@/modules/bank-statements/domain/ports/bank-statement-repository.port';
import { PDF_BASE64_PORT } from '@/modules/bank-statements/domain/ports/pdf-base64.port';
import { PdfToBase64Adapter } from '@/modules/bank-statements/infrastructure/pdf/pdf-to-base64.adapter';
import { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';
import { ProcessOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/process.orm-entity';
import { ProductOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/product.orm-entity';
import { TypeormBankStatementRepository } from '@/modules/bank-statements/infrastructure/persistence/repositories/typeorm-bank-statement.repository';
import { BankStatementsController } from '@/modules/bank-statements/presentation/controllers/bank-statements.controller';

@Module({
	controllers: [BankStatementsController],
	imports: [TypeOrmModule.forFeature([BankStatementOrmEntity, ProcessOrmEntity, ProductOrmEntity])],
	providers: [
		GetBankStatementsUseCase,
		TypeormBankStatementRepository,
		PdfToBase64Adapter,
		{
			provide: BANK_STATEMENT_REPOSITORY,
			useExisting: TypeormBankStatementRepository,
		},
		{
			provide: PDF_BASE64_PORT,
			useExisting: PdfToBase64Adapter,
		},
	],
})
export class BankStatementsModule {}
