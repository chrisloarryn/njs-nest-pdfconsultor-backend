import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('procesos', { schema: 'public' })
export class ProcessOrmEntity {
	@PrimaryColumn({ primaryKeyConstraintName: 'procesos_pk', type: 'integer' })
	prc_id!: number;

	@Column({ nullable: true, type: 'varchar' })
	prd_id!: string | null;

	@Column({ nullable: true, type: 'varchar' })
	prc_periodo!: string | null;

	@Column({ nullable: true, type: 'timestamp' })
	prc_fch_desde!: Date | null;

	@Column({ nullable: true, type: 'timestamp' })
	prc_fch_hasta!: Date | null;

	@VersionColumn({ type: 'integer' })
	version!: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at!: Date;
}
