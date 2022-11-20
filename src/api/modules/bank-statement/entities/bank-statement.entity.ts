//Cartolas
import { ApiProperty } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Column, PrimaryColumn, CreateDateColumn, Entity, UpdateDateColumn, VersionColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

import { Process } from '../../process/entities/process.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('cartolas', { schema: 'public' })
export class BankStatement {
	@ApiProperty()
	@PrimaryColumn({
		comment: 'Id del Proceso',
		primary: true,
		generated: false,
		primaryKeyConstraintName: 'cartolas_pk',
		type: 'integer',
	})
	prc_id: number;

	@ApiProperty()
	@PrimaryColumn({
		comment: 'Id del Producto',
		primary: true,
		generated: false,
		primaryKeyConstraintName: 'cartolas_pk',
		type: 'varchar',
	})
	prd_id: string;

	@ApiProperty()
	@PrimaryColumn({
		comment: 'Folio Cartola',
		primary: true,
		generated: false,
		primaryKeyConstraintName: 'cartolas_pk',
		type: 'varchar',
	})
	car_folio: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Rut Cartola', type: 'integer' })
	car_rut: number;

	@ApiProperty()
	@Column({ nullable: true, comment: 'URL Ubicación Archivo', type: 'varchar' })
	car_url: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Periodo', type: 'varchar' })
	car_periodo: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Nombre Archivo Cartola', type: 'varchar' })
	car_name: string;

	@ApiProperty()
	@VersionColumn({ comment: 'Version de cambios en Cartola', type: 'integer' })
	version: number;

	@ApiProperty()
	@CreateDateColumn({ comment: 'Fecha de creación de Cartola', type: 'date' })
	created_at: Date;

	@ApiProperty()
	@UpdateDateColumn({ comment: 'Fecha de actualización de Cartola', type: 'date' })
	updated_at: Date;

	// methods
	setBankStatementFolio(folio: string) {
		this.car_folio = folio;
		return this;
	}
	setBankStatementName(name: string) {
		this.car_name = name;
		return this;
	}
	setBankStatementRut(rut: number) {
		this.car_rut = rut;
		return this;
	}
	setBankStatementUrl(url: string) {
		this.car_url = url;
		return this;
	}
	setBankStatementProcessID(processID: number) {
		this.prc_id = processID;
		return this;
	}
	setBankStatementProductID(productID: string) {
		this.prd_id = productID;
		return this;
	}
	setBankStatementPeriod(period: string) {
		this.car_periodo = period;
		return this;
	}
	toJson() {
		return instanceToPlain(this);
	}

	// relations
	@ApiProperty({
		type: () => Process,
	})
	@ManyToOne(() => Process, (process) => process.prc_id, {
		onDelete: 'CASCADE',
		createForeignKeyConstraints: false,
	})
	@JoinColumn({
		foreignKeyConstraintName: 'procesos_pk',
		name: 'prc_id',
		referencedColumnName: 'prc_id',
	})
	process: Process;

	@ApiProperty({
		type: () => Product,
	})
	@OneToOne(() => Product, {
		onDelete: 'CASCADE',
		createForeignKeyConstraints: false,
	})
	@JoinColumn({
		foreignKeyConstraintName: 'productos_pk',
		name: 'prd_id',
		referencedColumnName: 'prd_id',
	})
	product: Product;
}
