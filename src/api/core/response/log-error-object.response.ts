import { ErrorResponse } from './error.response';

export class MetaErrorObject {
	'Id-Transaccion'?: string;
	status: number;
	error: ErrorResponse;
}

export class LogErrorObjectResponse {
	message: string;
	meta: MetaErrorObject;
}
