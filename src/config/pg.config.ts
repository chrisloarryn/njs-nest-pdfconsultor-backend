import { registerAs } from '@nestjs/config';

export default registerAs('pg', () => ({
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASS,
	database: process.env.POSTGRES_DB,
	synchronize: process.env.POSTGRES_SYNCHRONIZE || false,
	logging: process.env.POSTGRES_LOGGING || false,
	autoLoadEntities: true,
	entities: ['dist/**/*.entity{.ts,.js}'],
	schema: 'public',
	migrations: [__dirname + '/../migrations/*{.ts,.js}'],
	subscribers: [__dirname + '/../subscribers/*{.ts,.js}'],
}));
