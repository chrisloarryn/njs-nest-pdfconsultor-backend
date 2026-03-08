export interface BankStatement {
	createdAt: Date | null;
	folio: string;
	name: string | null;
	period: string | null;
	processId: number;
	productId: string;
	rut: number | null;
	updatedAt: Date | null;
	url: string;
}

export interface BankStatementSummary {
	createdAt: Date | null;
	folio: string;
	period: string | null;
	rut: number | null;
	url: string;
}

export interface BankStatementBase64Summary extends BankStatementSummary {
	base64: string;
}
