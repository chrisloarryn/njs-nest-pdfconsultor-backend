import { InMemoryDBEntity } from '@nestjs-addons/in-memory-db';

export interface BankStatementEntity extends InMemoryDBEntity {
	prc_id: number;
	prd_id: string;
	car_folio: string;
	car_rut: number;
	car_url: string;
	car_periodo: string;
	car_name: string;
	created_at: string;
	updated_at: string;
}

// TODO: /Users/cristobalcontreras/GitHub/CLA/njs-nest-motortasas-backend
// TODO: /Users/cristobalcontreras/GitHub/CLA/njs-nest-persona-backend
