import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BankStatementController } from '@ccla/api/modules/bank-statement/controller/bank-statement.controller';
import { BankStatementService } from '@ccla/api/modules/bank-statement/service/bank-statement.service';

import { Process } from '../process/entities/process.entity';
import { Product } from '../product/entities/product.entity';
import { BankStatement } from './entities';
import { BankStatementRepository } from './repository/bank-statement.repository';

@Module({
	imports: [TypeOrmModule.forFeature([BankStatement, Process, Product])],
	controllers: [BankStatementController],
	providers: [BankStatementService, BankStatementRepository],
})
export class BankStatementModule {}
