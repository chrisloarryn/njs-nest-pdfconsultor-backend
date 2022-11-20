```sh
	# -Dsonar.test.inclusions=**/*.spec.ts,**/*.itest.ts \
sonar-scanner \
  -Dsonar.projectKey=njs-nest-pdfconsultor-backend \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=sqp_46479ab33492a9395676b1be19f49251b3735689 \
	-Dsonar.tests=. \
	-Donar.test.exclusions="**/node_modules/**,**/dist/**,**/coverage/**,**/src/api/modules/product/entities/product.entity.ts,**/src/api/modules/process/entities/process.entity.ts,**/src/api/modules/bank-statement/entities/bank-statement.entity.ts,**/src/config/http.config.ts,**/src/config/loggerConfig.ts,**/src/api/common/utils/validador-rut.ts,**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*" \
	-Dsonar.testExecutionReportPaths=coverage/lcov.info \
	-Dsonar.typescript.coverage.reportPaths=test-results.xml \
	-Dsonar.typescript.tests.reportPaths=json-test-results.json
```
