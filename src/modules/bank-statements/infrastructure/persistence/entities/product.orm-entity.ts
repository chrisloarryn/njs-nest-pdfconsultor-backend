import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('productos', { schema: 'public' })
export class ProductOrmEntity {
	@PrimaryColumn({ primaryKeyConstraintName: 'productos_pk', type: 'varchar' })
	prd_id!: string;

	@Column({ nullable: true, type: 'varchar' })
	prd_nombre!: string | null;

	@Column({ nullable: true, type: 'varchar' })
	prd_tipo!: string | null;

	@Column({ nullable: true, type: 'integer' })
	prd_frecuencia!: number | null;

	@Column({ nullable: true, type: 'integer' })
	prd_aprobacion!: number | null;

	@Column({ nullable: true, type: 'boolean' })
	prd_estado!: boolean | null;

	@VersionColumn({ type: 'integer' })
	version!: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at!: Date;
}
