//Procesos

import { ApiProperty } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

import { BankStatement } from './../../bank-statement/entities';

@Entity('procesos', { schema: 'public' })
export class Process {
	@ApiProperty()
	@PrimaryGeneratedColumn('increment', {
		type: 'integer',
		comment: 'Código Proceso',
		primaryKeyConstraintName: 'procesos_pk',
	})
	prc_id: number;

	@ApiProperty()
	@Column({
		nullable: true,
		comment: 'Código Producto',
		type: 'varchar',
	})
	prd_id: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Periodo', type: 'varchar' })
	prc_periodo: string;

	// datetime
	@ApiProperty()
	@Column({ nullable: true, comment: 'Fecha Inicial Periodo', type: 'datetime' })
	prc_fch_desde: Date;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Fecha Final Periodo', type: 'datetime' })
	prc_fch_hasta: Date;

	@ApiProperty()
	@VersionColumn({ comment: 'Versión de cambios en Proceso', type: 'integer' })
	version: number;

	@ApiProperty()
	@CreateDateColumn({ comment: 'Fecha de creación' })
	created_at: Date;

	@ApiProperty()
	@UpdateDateColumn({ comment: 'Fecha de actualización' })
	updated_at: Date;

	// methods
	setStartDate(startDate: Date) {
		this.prc_fch_desde = startDate;
		return this;
	}
	setEndDate(endDate: Date) {
		this.prc_fch_hasta = endDate;
		return this;
	}
	setPeriod(period: string) {
		this.prc_periodo = period;
		return this;
	}
	setProductID(productID: string) {
		this.prd_id = productID;
		return this;
	}
	toJson() {
		return instanceToPlain(this);
	}

	// relations

	@ApiProperty({
		type: () => BankStatement,
	})
	@OneToMany(() => BankStatement, (bankStatement) => bankStatement.prc_id, {
		onDelete: 'CASCADE',
		createForeignKeyConstraints: false,
	})
	@JoinColumn({
		foreignKeyConstraintName: 'cartolas_pk',
		name: 'prc_id',
		referencedColumnName: 'prc_id',
	})
	bankStatements: BankStatement[];
}
