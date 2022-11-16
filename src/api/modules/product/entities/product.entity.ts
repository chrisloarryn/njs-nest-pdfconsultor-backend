// Productos

import { ApiProperty } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

import { ApprovalEnum } from '../enum';

@Entity('productos', { schema: 'public' })
export class Product {
	// properties
	// TODO: check this, because in definition was string value and it needs TBD.
	@ApiProperty()
	@PrimaryGeneratedColumn('uuid', {
		comment: 'Id del Producto',
		primaryKeyConstraintName: 'productos_pk',
	})
	prd_id: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Nombre de Producto', type: 'varchar' })
	prd_nombre: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Tipo de Producto', type: 'varchar' })
	prd_tipo: string;

	@ApiProperty()
	@Column({ nullable: true, comment: 'Frecuencia de ejecución', type: 'integer' })
	prd_frecuencia: number;

	@ApiProperty()
	@Column({
		nullable: true,
		enum: ApprovalEnum,
		comment: 'Nivel de Aprobación (Nivel 0, NIvel 1, Nivel 2)',
		type: 'integer',
	})
	prd_aprobacion: number;

	@ApiProperty()
	@Column({
		nullable: true,
		comment: 'Nivel de Aprobación (Nivel 0, NIvel 1, Nivel 2)',
		type: 'boolean',
	})
	prd_estado: boolean;

	@ApiProperty()
	@VersionColumn({ comment: 'Version de cambios en Producto', type: 'integer' })
	version: number;

	@ApiProperty()
	@CreateDateColumn({ comment: 'Fecha de creación de Producto' })
	created_at: Date;

	@ApiProperty()
	@UpdateDateColumn({ comment: 'Fecha de actualización de Producto' })
	updated_at: Date;

	// methods
	setProductApproval(approval: /**one of enum */ number) {
		this.prd_aprobacion = approval;
		return this;
	}
	setProductState(state: boolean) {
		this.prd_estado = state;
		return this;
	}
	setProductFrequency(frequency: number) {
		this.prd_frecuencia = frequency;
		return this;
	}
	setProductName(name: string) {
		this.prd_nombre = name;
		return this;
	}
	setProductType(type: string) {
		this.prd_tipo = type;
		return this;
	}
	toJson() {
		return instanceToPlain(this);
	}
}
