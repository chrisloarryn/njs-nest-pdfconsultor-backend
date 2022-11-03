import { ApiProperty } from '@nestjs/swagger';

export class ExternalServiceErrorResponse {
	@ApiProperty()
	message: string;

	@ApiProperty()
	status: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	stack: string;
}

export class InvalidParametersErrorResponse {
	@ApiProperty()
	name: string;

	@ApiProperty()
	reason: string;
}

export class ErrorResponse {
	@ApiProperty()
	title: string;

	@ApiProperty()
	detail: string;

	@ApiProperty()
	type: string;

	@ApiProperty()
	status: number;

	@ApiProperty()
	instance?: string;

	@ApiProperty()
	codigoDeError: number;

	@ApiProperty()
	'invalid-params'?: InvalidParametersErrorResponse[];

	@ApiProperty()
	'external-service-error'?: ExternalServiceErrorResponse;
}
