import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Process } from '../process/entities/process.entity';
import { Product } from '../product/entities/product.entity';
import { BankStatementController } from './controller/bank-statement.controller';
import { BankStatement } from './entities';
import { BankStatementRepository } from './repository/bank-statement.repository';
import { BankStatementService } from './service/bank-statement.service';

@Module({
	imports: [TypeOrmModule.forFeature([BankStatement, Process, Product])],
	controllers: [BankStatementController],
	providers: [BankStatementService, BankStatementRepository],
	exports: [TypeOrmModule],
})
export class BankStatementModule {}
