import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('usuarios', { schema: 'public' })
export class User {
	setUserName(usrName: string) {
		this.usr_name = usrName;
		return this;
	}
	setUserLastName(lastName: string) {
		this.usr_last_name = lastName;
		return this;
	}
	setUserEmail(email: string) {
		this.usr_email = email;
		return this;
	}

	@ApiProperty()
	@PrimaryGeneratedColumn()
	usr_id: number;

	@ApiProperty()
	@Column({ nullable: false })
	usr_name: string;

	@ApiProperty()
	@Column({ nullable: true })
	usr_last_name: string;

	@ApiProperty()
	@Column({ nullable: false, unique: true })
	usr_email: string;

	@ApiProperty()
	@VersionColumn({ default: 1 })
	version: number;

	@ApiProperty({ type: Date })
	@CreateDateColumn()
	created_at: Date;

	@ApiProperty({ type: Date })
	@UpdateDateColumn()
	updated_at: Date;
}
