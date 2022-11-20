import { BadRequestException } from '@nestjs/common';

export function validateIdTransaccion(_idTransaccion: string) {
	if (!_idTransaccion) {
		throw new BadRequestException();
	}
}
