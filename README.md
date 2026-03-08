# njs-nest-pdfconsultor-backend

Microservicio NestJS para consultar cartolas PDF almacenadas en PostgreSQL.

## Resumen

- Runtime: Node `25.8.0`
- Package manager: Yarn `1.22.22`
- Framework: NestJS `11`
- Persistencia: TypeORM `0.3` + PostgreSQL
- Tests:
  - Vitest para unitarias
  - Jest + Supertest para e2e
- Arquitectura: hexagonal

## Estructura

```text
src
├── modules
│   ├── bank-statements
│   │   ├── application
│   │   ├── domain
│   │   ├── infrastructure
│   │   └── presentation
│   └── health
└── shared
    ├── domain
    ├── infrastructure
    ├── presentation
    └── testing
```

### Criterio de capas

- `domain`: modelos y puertos
- `application`: casos de uso
- `infrastructure`: adapters concretos de DB, logging y PDF
- `presentation`: controllers, DTOs, pipes y filtros

## Endpoints

### Health

- `GET /<GLOBAL_PREFIX>/health`

### Bank statements

- `GET /<GLOBAL_PREFIX>/bank-statements/pdf`

Headers soportados:

- `X-Period`
- `X-Rut`
- `X-Folio`

Query soportado:

- `b64=true|false`

### Reglas de búsqueda

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

- Para e2e se usa `DATABASE_DRIVER=pg-mem`.
- En ambientes no productivos Swagger queda disponible en `/<GLOBAL_PREFIX>/<SWAGGER_URL>`.

## NVM

El repo fija Node en `.nvmrc`:

```bash
25.8.0
```

El entorno local quedó alineado con:

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

```bash
yarn start:dev
```

## Scripts

```bash
yarn lint
yarn test
yarn test:e2e
yarn build
yarn coverage
```

## Verificación actual

Estado validado en esta modernización:

- `yarn lint`
- `yarn test`
- `yarn test:e2e`
- `yarn build`

La cobertura unitaria actual quedó sobre 84%.
