import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
	globalPrefix: process.env.GLOBAL_PREFIX ?? 'cartolab',
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number(process.env.PORT ?? 3000),
	serviceName: 'njs-nest-pdfconsultor-backend',
	swagger: {
		contactEmail: process.env.SWAGGER_CONTACT_EMAIL ?? 'arquitectura@example.com',
		contactName: process.env.SWAGGER_CONTACT_NAME ?? 'Arquitectura',
		description: process.env.SWAGGER_DESCRIPTION ?? 'API para consulta de cartolas PDF',
		name: process.env.SWAGGER_NAME ?? 'PDF Consultor API',
		url: process.env.SWAGGER_URL ?? 'api-docs',
		version: process.env.SWAGGER_VERSION ?? '1.0.0',
	},
}));
