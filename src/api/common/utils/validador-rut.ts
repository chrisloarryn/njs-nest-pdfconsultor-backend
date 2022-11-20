import { validate, digits, clean } from '@validatecl/rut';

export class ValidadorRut {
	/**
	 * Function get digito varificador.
	 * @author Emmanuel Carballo
	 * @param T
	 * @return {any} digito verificador
	 */
	private static validacionDV(dv: number | string): any {
		let M = 0,
			S = 1;
		for (; dv; dv = Math.floor(Number(dv) / 10)) S = (S + (Number(dv) % 10) * (9 - (M++ % 6))) % 11;
		return S ? S - 1 : 'k';
	}

	/**
	 * Function get rut valid or not
	 * @author
	 * @param rut
	 * @param dv
	 * @return {booelan} validacion rut
	 */
	public static validacionRut(rut: number, dv: string): boolean {
		if (!/^\d+[-|‐]{1}[0-9kK]{1}$/.test(rut + '-' + dv)) {
			return false;
		}

		if (dv == 'K') dv = 'k';
		return this.validacionDV(rut) == dv;
	}

	/**
	 * Function get dv valid or not
	 * @author
	 * @param dvPer
	 * @return {booelan} validacion dv
	 */
	public static validacionLargoDV(dv: string): boolean {
		if (dv.length > 1) return false;
		else return true;
	}

	public static isValid(rut: string): boolean {
		return validate(rut);
	}

	public static validateChileanRutAndGetOnlyNumbers(rut: string): string | null {
		if (!validate(rut)) {
			return null;
		}
		const rutClean = clean(rut) as string;
		const rutDigits = digits(rutClean);
		return rutDigits;
	}
}
