import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class TestDTO {
	@IsNumberString({}, { message: '{"name":"number", "reason":"debe ser un numero"}' })
	@Length(1, 4, { message: '{"name":"number", "reason":"debe ser menor a 4 y mayor a 1 caracter"}' })
	@IsNotEmpty({ message: '{"name": "number", "reason": "number no puede estar vacio"}' })
	number: number;
}
