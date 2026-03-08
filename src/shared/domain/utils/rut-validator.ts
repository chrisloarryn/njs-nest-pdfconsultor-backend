import { clean, digits, validate } from '@validatecl/rut';

export class RutValidator {
	public static isValid(rut: string): boolean {
		return validate(rut);
	}

	public static normalize(rut: string): number | null {
		if (!validate(rut)) {
			return null;
		}

		return Number(digits(clean(rut) as string));
	}
}
