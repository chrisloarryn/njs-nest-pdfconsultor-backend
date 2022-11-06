export class MetaInfoObject {
	'Id-Transaccion'?: string;
	status?: number;
	response?: string;
}

export class LogInfoObjectResponse {
	message: string;
	meta?: MetaInfoObject;
}
