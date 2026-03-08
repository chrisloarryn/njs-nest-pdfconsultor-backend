import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const healthDuration = new Trend('health_duration', true);
const bankStatementDuration = new Trend('bank_statement_duration', true);

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const summaryPath = __ENV.K6_SUMMARY_PATH || 'artifacts/performance/k6-summary.json';
const bankStatementHeaders = {
	'X-Folio': 'FOLIO-001',
	'X-Period': '202401',
	'X-Rut': '18.979.569-6',
};

export const options = {
	summaryTrendStats: ['avg', 'p(95)', 'p(99)'],
	scenarios: {
		health: {
			executor: 'constant-vus',
			exec: 'healthScenario',
			vus: 5,
			duration: '15s',
			tags: { scenario: 'health' },
		},
		bank_statements: {
			executor: 'ramping-vus',
			exec: 'bankStatementsScenario',
			startVUs: 1,
			stages: [
				{ duration: '10s', target: 5 },
				{ duration: '20s', target: 10 },
				{ duration: '10s', target: 0 },
			],
			tags: { scenario: 'bank_statements' },
		},
	},
	thresholds: {
		http_req_failed: ['rate<0.01'],
		checks: ['rate>0.99'],
		'http_req_duration{scenario:health}': ['p(95)<250'],
		'http_req_duration{scenario:bank_statements}': ['p(95)<800', 'p(99)<1500'],
		health_duration: ['p(95)<250'],
		bank_statement_duration: ['p(95)<800', 'p(99)<1500'],
	},
};

export function healthScenario() {
	const response = http.get(`${baseUrl}/cartolab/health`, {
		tags: { scenario: 'health' },
	});

	healthDuration.add(response.timings.duration);
	check(response, {
		'health status is 200': (res) => res.status === 200,
		'health response contains status': (res) => {
			const body = res.json();
			return typeof body === 'object' && body !== null && 'status' in body;
		},
	});
	sleep(0.5);
}

export function bankStatementsScenario() {
	const useBase64 = __ITER % 2 === 0;
	const queryString = useBase64 ? '?b64=true' : '';
	const response = http.get(`${baseUrl}/cartolab/bank-statements/pdf${queryString}`, {
		headers: bankStatementHeaders,
		tags: { scenario: 'bank_statements' },
	});

	bankStatementDuration.add(response.timings.duration);
	check(response, {
		'bank statements status is 200': (res) => res.status === 200,
		'bank statements response is an array': (res) => Array.isArray(res.json()),
		'bank statements returns at least one row': (res) => Array.isArray(res.json()) && res.json().length > 0,
	});
	sleep(1);
}

export function handleSummary(data) {
	const failedThresholds = [];
	for (const [metricName, metric] of Object.entries(data.metrics || {})) {
		for (const [thresholdName, passed] of Object.entries(metric.thresholds || {})) {
			if (!passed) {
				failedThresholds.push(`${metricName}:${thresholdName}`);
			}
		}
	}

	const summary = {
		checks: {
			pass_rate: metricValue(data, 'checks', 'rate'),
		},
		durations_ms: {
			avg: metricValue(data, 'http_req_duration', 'avg'),
			bank_statements_p95: metricValue(data, 'bank_statement_duration', 'p(95)'),
			bank_statements_p99: metricValue(data, 'bank_statement_duration', 'p(99)'),
			health_p95: metricValue(data, 'health_duration', 'p(95)'),
		},
		requests: {
			failed_rate: metricValue(data, 'http_req_failed', 'rate'),
			throughput_rps: metricValue(data, 'http_reqs', 'rate'),
			total: metricValue(data, 'http_reqs', 'count'),
		},
		thresholds: {
			failed: failedThresholds,
			total: Object.values(data.metrics || {}).reduce((count, metric) => count + Object.keys(metric.thresholds || {}).length, 0),
		},
	};

	return {
		[summaryPath]: JSON.stringify(summary, null, 2),
	};
}

function metricValue(data, metricName, key) {
	return data.metrics?.[metricName]?.values?.[key] ?? 0;
}
