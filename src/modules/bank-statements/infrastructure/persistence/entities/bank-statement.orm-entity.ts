import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('cartolas', { schema: 'public' })
export class BankStatementOrmEntity {
	@PrimaryColumn({ primaryKeyConstraintName: 'cartolas_pk', type: 'integer' })
	prc_id!: number;

	@PrimaryColumn({ primaryKeyConstraintName: 'cartolas_pk', type: 'varchar' })
	prd_id!: string;

	@PrimaryColumn({ primaryKeyConstraintName: 'cartolas_pk', type: 'varchar' })
	car_folio!: string;

	@Column({ nullable: true, type: 'integer' })
	car_rut!: number | null;

	@Column({ nullable: true, type: 'varchar' })
	car_url!: string;

	@Column({ nullable: true, type: 'varchar' })
	car_periodo!: string | null;

	@Column({ nullable: true, type: 'varchar' })
	car_name!: string | null;

	@VersionColumn({ type: 'integer' })
	version!: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at!: Date;
}
