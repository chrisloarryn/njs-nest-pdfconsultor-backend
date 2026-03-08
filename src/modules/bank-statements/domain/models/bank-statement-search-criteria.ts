export interface BankStatementSearchOptions {
	base64: boolean;
}

export interface BankStatementSearchCriteria {
	folio?: string;
	options: BankStatementSearchOptions;
	period?: string;
	rut?: string;
}
