import { BadRequestException, Controller, Get, Headers, HttpException, HttpStatus, InternalServerErrorException, Param } from '@nestjs/common';

import { TestDTO } from '../dto/test.dto';
import { validateIdTransaccion } from '../utils/validation-options';

@Controller()
export class TestController {
	/**
	 * Metodo de prueba de manejo de error y escritura de logs
	 * @param idTransaccion id de la transaccion
	 * @param params parametros de entrada
	 * @returns  Promise<{data:string}>
	 */
	@Get('pruebas/:number')
	prueba(@Headers('Id-Transaccion') idTransaccion: string, @Param() params: TestDTO): Promise<{ data: string }> {
		try {
			validateIdTransaccion(idTransaccion);
			if (params.number == 0) {
				return JSON.parse('{"data":"algo"}');
			}
			throw new HttpException('', HttpStatus.NO_CONTENT);
		} catch (error) {
			if (error instanceof HttpException || error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException(error);
		}
	}
}
