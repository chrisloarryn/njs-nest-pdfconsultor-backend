# njs-nest-pdfconsultor-backend

Servicio NestJS para consultar cartolas PDF, modernizado a Node `25.8.0`, con estructura hexagonal y pipeline `Validate` en GitHub Actions.

## Resumen

- Runtime: Node `25.8.0`
- Package manager: Yarn `1.22.22`
- Framework: NestJS `11`
- Persistencia: TypeORM `0.3` con `postgres` o `pg-mem`
- Testing:
  - Vitest para unitarias
  - Jest + Supertest para e2e
  - Schemathesis para contrato OpenAPI
  - k6 para performance
- Arquitectura: hexagonal

## Estructura

```text
src
├── ci
├── modules
│   ├── bank-statements
│   │   ├── application
│   │   ├── domain
│   │   ├── infrastructure
│   │   └── presentation
│   └── health
├── shared
│   ├── domain
│   ├── infrastructure
│   ├── presentation
│   └── testing
└── types
```

Capas:

- `domain`: modelos y puertos
- `application`: casos de uso
- `infrastructure`: adapters de DB, logging y PDF
- `presentation`: controllers, DTOs, pipes y filtros
- `ci`: bootstrap, seed y export OpenAPI para validaciones automatizadas

## Endpoints

- `GET /<GLOBAL_PREFIX>/health`
- `GET /<GLOBAL_PREFIX>/bank-statements/pdf`

Headers soportados:

- `X-Period`
- `X-Rut`
- `X-Folio`

Query soportado:

- `b64=true|false`

Reglas de búsqueda:

- `period + folio`
- `rut`
- `rut + folio`
- `rut + period`
- `rut + period + folio`

Si se envía `period` sin `rut` ni `folio`, el servicio responde `400`.

## Ejemplos

Buscar por periodo y folio:

```bash
curl --request GET 'http://localhost:5500/cartolab/bank-statements/pdf' \
  --header 'X-Period: 202401' \
  --header 'X-Folio: FOLIO-001'
```

Buscar por rut y devolver base64:

```bash
curl --request GET 'http://localhost:5500/cartolab/bank-statements/pdf?b64=true' \
  --header 'X-Rut: 18.979.569-6'
```

## Configuración

Las variables se cargan desde `env/<NODE_ENV>.env`.

Variables principales:

```env
NODE_ENV=development
PORT=5500
GLOBAL_PREFIX=cartolab
LOG_LEVEL=info

DATABASE_DRIVER=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=pdfconsultor
POSTGRES_USER=postgres
POSTGRES_PASS=postgres
POSTGRES_SYNCHRONIZE=false
POSTGRES_LOGGING=false

SWAGGER_URL=api-docs
SWAGGER_NAME=PDF Consultor API
SWAGGER_DESCRIPTION=API para consulta de cartolas PDF
SWAGGER_VERSION=1.0.0
SWAGGER_CONTACT_NAME=Arquitectura
SWAGGER_CONTACT_EMAIL=arquitectura@example.com
```

Notas:

- Para e2e y CI se usa `DATABASE_DRIVER=pg-mem`.
- En ambientes no productivos Swagger queda disponible en `/<GLOBAL_PREFIX>/<SWAGGER_URL>`.

## Node y NVM

El repo fija Node en `.nvmrc`:

```bash
25.8.0
```

Alineación local recomendada:

```bash
nvm install 25.8.0
nvm alias default 25.8.0
nvm use 25.8.0
```

## Instalación

```bash
yarn install
```

## Ejecución local

Servidor en desarrollo:

```bash
yarn start:dev
```

Servidor CI-like con `pg-mem` y seed:

```bash
yarn start:ci
```

## Scripts

Base:

```bash
yarn lint
yarn build
yarn test
yarn test:e2e
yarn coverage
```

CI y validaciones:

```bash
yarn test:ci
yarn test:e2e:ci
yarn coverage:ci
yarn seed:ci
yarn openapi:export
yarn perf:ci
```

Notas:

- `yarn openapi:export` genera el `openapi.json` usado por las pruebas de contrato.
- `yarn perf:ci` requiere `k6` instalado localmente.
- Las pruebas de contrato en CI usan Schemathesis sobre la spec OpenAPI exportada.

## Workflow Validate

El repo usa [`.github/workflows/validate.yml`](/Users/cristobalcontreras/GitHub/CLA/njs-nest-cartolas-pdf-consultor/.github/workflows/validate.yml) como pipeline principal en GitHub Actions.

Jobs:

- `tests`: Vitest + Jest e2e con artifacts
- `coverage-quality-gate`: cobertura con gate bloqueante al `90%`
- `contract-tests`: export OpenAPI + server local + Schemathesis
- `performance-tests`: server local + k6
- `validation-summary`: resumen final con métricas y artifacts

Artifacts publicados:

- `test-report`
- `coverage-report`
- `contract-report`
- `performance-report`

## Verificación local realizada

Validado sobre Node `25.8.0`:

- `yarn lint`
- `yarn build`
- `yarn test:run`
- `yarn test:e2e`
- `yarn test:ci`
- `yarn coverage:ci`
- `yarn seed:ci`
- `yarn openapi:export`
- Schemathesis contra servidor local
- `k6` contra `/cartolab/health` y `/cartolab/bank-statements/pdf`

Estado actual de cobertura:

- líneas: `84.44%`
- statements: `84%`

El workflow `Validate` deja el gate en `90%`, por lo que hoy la etapa de cobertura queda roja hasta ampliar la suite.
