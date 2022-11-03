import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller()
export class HealthController {
	constructor(private health: HealthCheckService, private http: HttpHealthIndicator) {}

	@Get('health')
	@HealthCheck()
	check() {
		return this.health.check([]);
	}
}
