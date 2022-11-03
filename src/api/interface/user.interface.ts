import { InMemoryDBEntity } from '@nestjs-addons/in-memory-db';

export interface UserEntity extends InMemoryDBEntity {
	usr_name: string;
	usr_last_name: string;
	usr_email: string;

	version?: number;
	created_at?: Date;
	updated_at?: Date;
}
