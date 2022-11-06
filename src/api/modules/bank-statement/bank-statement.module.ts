import { Module } from '@nestjs/common';

import { BankStatementController } from '@ccla/api/modules/bank-statement/bank-statement.controller';
import { BankStatementService } from '@ccla/api/modules/bank-statement/bank-statement.service';
import { BankStatementRepository } from '@ccla/api/repository/bank-statement.repository';

@Module({
	controllers: [BankStatementController],
	providers: [BankStatementService, BankStatementRepository],
})
export class BankStatementModule {}
