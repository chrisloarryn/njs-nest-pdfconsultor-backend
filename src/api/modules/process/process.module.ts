import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BankStatement } from './../bank-statement/entities';

@Module({
	imports: [TypeOrmModule.forFeature([BankStatement])],
})
export class BankStatementModule {}
