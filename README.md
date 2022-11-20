## Indice

[TOC]

# Antecedentes Generales

## Ramas del proyecto

La última versión del arquetipo se encuentra en la rama develop. Las versiones anteriores se pueden ver en las ramas con la nomenclatura `njs-nest-msusecases-backend-<version>`. La documentación del uso del arquetipo se encuentra en la misma rama de la versión a utilizar.

Por ejemplo, la documentación de uso del arquetipo versión 0.0.1 está disponible en **GitLab njs-nest-msusecases-backend-0.0.1**

# Arquetipo NodeJs para microservicios en Nest

**Importante:** Si necesitas utilizar una conexión a base de datos, este es tu arquetipo!.
**Importante:** Si buscas un arquetipo para utilizarlo como BFF sin conexiones a bases de datos tu
arquetipo esta [aquí](https://gitlab.com/ccla/arquitectura-ccla-1/activos-arquitectura/bff-arquetipo-node-js/-/tree/feature/bff-arquetipo-node-js-v1.0).

Este repositorio contiene los artefactos necesarios para la disponibilización del arquetipo de microservicios que exponen API REST dentro del contexto NestJs.

Este arquetipo cumple el objetivo de ser un acelerador del desarrollo para los equipos que necesiten iniciar la construcción de nuevas piezas de software que expongan API REST y operen en la nube.

Este acelerador del desarrollo está construido bajo los lineamientos de arquitectura tecnológica para el desarrollo de microservicios y operar en la nube.

## Prerequisitos

Como pre-requisito de uso de este arquetipo es necesario contar con Node js (v16.13.2). Una guía para la instalación de Node se puede encontrar en la documentación oficial de [Node Js - How to Install Node.js][node_install_url].

Instalar gestor de paquetes Yarn (v1.22.18) para administrar las dependencias del proyecto. Para ello ejecutar el comando `yarn install`.

Para instalar postgresql en tu equipo sigue las instrucciones del sitio oficial [PostgreSQL Downloads](https://www.postgresql.org/download/) o para windows en el material de apoyo creado para este arquetipo [POSTGRESQL_CONFIG.md](https://gitlab.com/ccla/arquitectura-ccla-1/activos-arquitectura/documentacion-de-apoyo/-/blob/dev/POSTGRESQL_CONFIG.md).

En este punto es importante declarar, que postgresql crea una base de datos por defecto llamada postgres, la que esta declarada en las variables de entorno del proyecto, por lo cuál en este punto solo sería necesario agregar la contraseña y el puerto designados en la instalación en el `env/development.env` del arquetipo. Con esto el arquetipo queda operativo y al hacer una petición de crear un usuario, se creara la tabla users dentro del squema public de la base de datos postgres.

Para crear una base de datos distinta para el arquetipo ver en
[POSTGRESQL_CONFIG.md](https://gitlab.com/ccla/arquitectura-ccla-1/activos-arquitectura/documentacion-de-apoyo/-/blob/dev/POSTGRESQL_CONFIG.md).

## Instalación

Para la instalación debemos clonar el repositorio, ubicarse en la raiz del proyecto en la misma ruta que el archivo `package.json`.

Ejecutar el comando:

```bash
$ yarn install
```

**Nota:** Este comando instala las dependencias contenidas dentro del `package.json`, las que guardara dentro de la carpeta `node_modules`.

## Uso de este arquetipo

Este código fuente contiene el template para una aplicación que expone servicios REST utilizando el framework de [NestJS][nestjs_url]. Considerar este proyecto como una guía para el desarrollo de Microservicios.

El proyecto trabaja con [Yarn][yarn_url] como gestor de paquetes.

Para iniciar el microservicio de manera local, ejecutar el comando:

```bash
$ yarn start
```

### Pruebas

Para este arquetipo se tienen definido tres controladores donde cada uno de ellos cuenta con una url en especifico:

**Nota:** El path a utilizar por los diferentes crud, dependera totalmente de la variable `GLOBAL_PREFIX` en la cual debe estar en la instalacion en el `env/development.env`

- **UserController:** Operaciones CRUD a usuarios en base de datos Postgresql. **path:** `${GLOBAL_PREFIX}/users`
- **UserMemoryController:** Operaciones CRUD a usuarios en base de datos en cache. **path:** `${GLOBAL_PREFIX}/memory/users`
- **PostController:** Operaciones de composición entre objetos de distintas urls. **path:**`${GLOBAL_PREFIX}/posts`

Para ejecutar el código del arquetipo y probar los endpoints se tienen 2 opciones:

- **Mediante la interfaz de swagger:** Por defecto esta configurada en el path `/api/` en este punto puedes utilizar cualquiera de los métodos disponibles. Para más detalle ver en el apartado de swagger más abajo.
  1.  Inicializar el proyecto con `yarn start`.
  2.  Ir a tu navegador e ingresar la url `http://localhost:8081/api`.

![image info](../images/swagger.png)

- Probar los endpoints definidos en los controladores mediante postman:
  1. Inicializar el proyecto con `yarn start`.
  2. Enviar solicitud mediante postman.

![image info](../images/postman.png)

### HealthCheck

Es importante tener un endpoint para poder comprobar el estado del microservicio, es por ello que se utiliza la libreria [`@nestjs/terminus`](https://docs.nestjs.com/recipes/terminus) cuya implementación esta dentro del directorio `src/api/utils/health.controller.ts`.
Para verificar el estado del microservicio ir al path `${GLOBAL_PREFIX}/health ` y se obtendrá la siguiente respuesta:

```bash
{
  "status": "ok",
  "info": {

  },
  "error": {

  },
  "details": {

  }
}
```

Para configurar otros estados personalizados, la librería ofrece varias opciones que pueden verse [aquí](https://docs.nestjs.com/recipes/terminus).

### Componentes

1. Aplicación Nodejs construida con [NestJs][nestjs_url].

2. Dependencias y configuración para integración con una base de datos relacional [postgresql][postgresql_url].

3. Dependencias y configuración para integración con una base de datos en memoria [In-Memory DB][memory_db_url].

4. Test unitarios construidos con [Jest][jest_url] y [SuperTest][super_test_url] ambas dependencias vienen integradas dentro de NestJS.

5. Documentación de API y endpoints mediante [Swagger][swagger_url].

6. Logs construidos con [Winston Nest][winston_url].

### Propiedades Package.json

Algunas propiedades definidas para el arquetipo en el archivo `package.json` relevantes de mencionar son:

**Importante:** Modificar esta name, versión, description, author según corresponda.

- Nombre, descripción, author y versión del proyecto, utilizando la especificación de [SemVer][semver_url].

```json
"name": "msusecases",
"version": "0.0.1",
"description": "",
"author": "",
...
```

- Los Scripts indica comandos que podemos correr dentro de nuestro proyecto, asociándolos a una palabra clave para que yarn los reconozca cuando queramos ejecutarlos.

```json
"scripts": {
  "prebuild": "rimraf dist",
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "test:e2e:watch": "jest --config ./test/jest-e2e.json --watch"
}
```

- Por ejemplo :

```bash
$ yarn start
```

- Dependencies guarda los nombres y versiones de cada dependencia que se ha instalado dentro del proyecto. De esta forma, cada vez que alguien obtenga una copia de este proyecto, y corra el comando yarn install, se instalarán todas las dependencias aquí definidas.

```json
"dependencies": {
  "@google-cloud/logging-winston": "^5.1.0",
  "@hapi/joi": "^17.1.1",
  "@nestjs-addons/in-memory-db": "^3.0.3",
  "@nestjs/axios": "^0.1.0",
  "@nestjs/common": "^9.0.3",
  "@nestjs/config": "^2.2.0",
  "@nestjs/core": "^9.0.3",
  "@nestjs/mapped-types": "^1.0.1",
  "@nestjs/platform-express": "^9.0.3",
  "@nestjs/swagger": "^6.0.3",
  "@nestjs/terminus": "^9.0.0",
  "@nestjs/typeorm": "^9.0.0",
  "@supercharge/request-ip": "^1.1.2",
  "axios": "^0.27.2",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.13.2",
  "dotenv": "^16.0.1",
  "nest-winston": "^1.4.0",
  "pg": "^8.7.0",
  "reflect-metadata": "^0.1.13",
  "rimraf": "^3.0.2",
  "rxjs": "^7.5.2",
  "swagger-ui-express": "^4.3.0",
  "typeorm": "^0.3.7",
  "winston": "^3.3.3"
}
```

- DevDependencies cumple labor similar a dependencies con la diferencia que acá podemos incluir todas aquellas librerías que no son necesarias para que este proyecto corra en producción.

```json
"devDependencies": {
  "@nestjs/cli": "^9.0.0",
  "@nestjs/schematics": "^9.0.1",
  "@nestjs/testing": "^9.0.3",
  "@types/dotenv": "^8.2.0",
  "@types/express": "^4.17.11",
  "@types/jest": "^28.1.5",
  "@types/node": "^18.0.3",
  "@types/supertest": "^2.0.10",
  "@typescript-eslint/eslint-plugin": "^5.30.6",
  "@typescript-eslint/parser": "^5.30.6",
  "eslint": "^8.19.0",
  "eslint-config-prettier": "^8.1.0",
  "eslint-plugin-prettier": "^4.2.1",
  "jest": "^28.1.3",
  "moment": "^2.29.3",
  "node-irr": "^2.0.3",
  "prettier": "^2.2.1",
  "supertest": "^6.1.3",
  "ts-jest": "^28.0.5",
  "ts-loader": "^9.3.1",
  "ts-node": "^10.8.2",
  "tsconfig-paths": "^4.0.0",
  "typescript": "^4.1.5",
  "xml2js": "^0.4.23"
}
```

### Propiedades de la Aplicación

Las propiedades de la aplicación se establecen en la carpeta `env`. La carpeta señalada se omite debido al archivo `.gitignore` para mantener un tipo de seguridad en las variables utilizadas. Cabe destacar que la utilización de los archivos utilizados en esta carpeta está directamente relacionada con el entorno en el cuál se esta desplegando el microservicio, es decir, si se esta trabajando en desarrollo el documento utilizado será `env/development.env` o bien puede ser `env/production.env` o en algunos casos `env/test.env`. Dentro de las propiedades relevantes a mencionar se encuentran:

- Variables para la configuracion de la applicacion, como por ejemplo, declarar su entorno (NODE_ENV), el puerto que utilizara, el prefijo global que se utilizara para los diferentes servicios, etc.

```env
NODE_ENV
PORT
GLOBAL_PREFIX
GCP_KEY_JSON
GCP_PROJECT_ID
ERROR_FILTER_TYPE
```

- Variables para la configuracion de los registros de eventos para el logging por consola y GCP.

```env
LOG_LEVEL
LOG_SERVICE
LOG_ENV
LOG_NAME
```

- Variables para las configuraciones del módulo HttpModule

```env
HTTP_TIMEOUT
HTTP_MAX_REDIRECT
```

- Variables que establecen las configuraciones para integración con repositorio de datos. Estas configuraciones son en concreto para conectarse a base de datos Postgresql. Nombres de estas propiedades deberán modificarse de acuerdo a los requerimientos de cada implementación.

```env
POSTGRES_HOST
POSTGRES_USER
POSTGRES_PASS
POSTGRES_PORT
POSTGRES_DB
```

- Variables para la Configuracion de swagger y mantener la descripcion de la API documentada.

```env
SWAGGER_URL
SWAGGER_NAME
SWAGGER_DESCRIPTION
SWAGGER_VERSION
SWAGGER_CONTACT_NAME
SWAGGER_CONTACT_EMAIL
```

- Variables de endpoints que se utilizarán para los metodos de composición (servicios externos).

```env
REST_ENDPOINTS_JSONPLACEHOLDER
REST_ENDPOINTS_UNIVERSITIES
```

### Estructura

Este proyecto utiliza la estructura de Controller-Service-Repository. Todas las clases que implementan estas capas de la aplicación se encuentran en las carpetas que definen su responsabilidad. La organización de carpetas será de esta forma:

```
+-- src
|---|---api
|---|---|---controller
|---|---|---dto
|---|---|---entities
|---|---|---exceptions
|---|---|---interface
|---|---|---middleware
|---|---|---repository
|---|---|---response
|---|---|---service
|---|---|---utils
|---|---config
```

- Todas las carpeta dentro de api y también la carpeta config, contienen un `index.js` el cuál cumple la función de importar sus respectivas clases.

Dentro de las carpetas descritas encontramos lo siguiente:

- **controller:**

  - **Controladores:** Los controladores son responsables de manejar las solicitudes entrantes y devolver las respuestas al cliente. Para ello generalmente recurren a los Servicios.

- **dto:**

  - **DTO:** Un DTO (Data Transfer Object) es un esquema que define cómo debemos recibir los datos para realizar una acción sobre la base de datos.

- **entities:**
  - **Entities:** Una Entity es básicamente definir nuestra tabla en base de datos en un objeto.
- **exceptions:**

  - **Filters:** Los filters son una capa de excepciones que es responsable de procesar todas las excepciones no controladas dentro de la aplicación.

- **interface:**

  - Contiene interfaces que ayudan con la el modelado de los datos en los métodos. Utilizada especialmente para la implementación de base de datos en memoria.

- **middleware:**

  - **Middleware:** Los middleware a diferencia de Java son funciones que se llaman antes que el controlador. Las funciones de middleware tienen acceso a los objetos de solicitud y respuesta.

- **repository:**

  - **Repositorios:** Los Repositorios estan encargados de gestionar el acceso a los datos, contienen la definición de los métodos básicos de CRUD.

- **responses:**

  - **respuestas:** Las respuestas como su nombre lo dice, nos permite personalizar la respuesta de salida del servicio definido.

- **services:**

  - **Servicios:** Los servicios son responsables de hacer la lógica dentro del microservicios. Si esto incluye operaciones a bases de datos, estos recurren a los Repositorios.

- **utils:**

  - Contiene funciones o clases que son de utilidad dentro del microservicio por ejemplo: Funciones de mappeo, patrones, entre otros.

- **config:**
  - Contiene los valores de las configuraciones obtenidas de las variables de entorno de los distintos módulos a utilizar.

#### Escenciales

Dentro del arquetipo es importante mencionar aquellos archivos que son fundamentales para el funcionamiento de este. Estos son `src/main.ts` y `src/app.module.ts`

##### main.ts

En main.ts se encuentra una función asyncrona, que arrancará el microservicio. Dentro del archivo se realizan las siguientes acciones:

- Se Instancian las configuraciones del Logger y Open Api (Swagger),

- Se define la Instancia principal del proyecto el cual será el modulo `app.module.ts` mediante el comando `NestFactory.create`.

- Se define la herramienta `SWAGGER` para la descripcion de la API documentada.

- Se define de manera global en todo el proyecto el filtro `HttpExceptionFilter` que se encarga del manejo de excepciones.

- Se define de manera global en todo el proyecto validacion de datos de entrada `ValidationPipe()` se encargara de validar los datos de entrada si son correctos o no.

- Se define el logger que utilizara el proyecto en este caso `WINSTON_MODULE_NEST_PROVIDER` que se encarga de los registro de eventos.

- Se define de manera global un prefijo para los diferentes paths, este prefijo se obtendra mediante una variable de entorno `process.env.GLOBAL_PREFIX`, si no se encuentra quedara por defecto el prefijo que asignemos manualmente en este caso `msusecases/v1`

```ts
async function bootstrap() {
	const logger: LoggerConfig = new LoggerConfig();

	const configSwagger = new DocumentBuilder()
		.setTitle(process.env.SWAGGER_NAME || process.env['SWAGGER_NAME'])
		.setDescription(process.env.SWAGGER_DESCRIPTION || process.env['SWAGGER_DESCRIPTION'])
		.setVersion(process.env.SWAGGER_VERSION || process.env['SWAGGER_VERSION'])
		.setContact(
			process.env.SWAGGER_CONTACT_NAME || process.env['SWAGGER_CONTACT_NAME'],
			'',
			process.env.SWAGGER_CONTACT_EMAIL || process.env['SWAGGER_CONTACT_EMAIL'],
		)
		.build();

	const winstonLogger = WinstonModule.createLogger(logger.console());

	const app = await NestFactory.create(AppModule, {
		logger: winstonLogger,
	});

	winstonLogger.log('Preparing msusecases-backend application');

	if (process.env.NODE_ENV || process.env['NODE_ENV'] !== 'production') {
		const document = SwaggerModule.createDocument(app, configSwagger);
		SwaggerModule.setup(process.env.GLOBAL_PREFIX + '/' + process.env.SWAGGER_URL, app, document);
	}

	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(new ValidationPipe());
	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
	app.setGlobalPrefix(process.env.GLOBAL_PREFIX || 'msusecases/v1');
	await app.listen(process.env.PORT);

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
}

bootstrap();
```

##### app.module.ts

Es el modulo principal del arquetipo, por lo tanto, es el punto de partida para crear el gráfico del microservicio. Dentro nos encontramos con los siguientes puntos:

- Se agregan variables de entorno de forma global en el proyecto.

- Se Inicializan configuraciones del Logger y Postgres.

- Se inicializan los repository que se utilizaran para typeorm

- Se inicializa base de datos en memoria.

- Se configura módulo HttpModule.

- Se importan Modulos que serán utilizados dentro de este.

- Se Instancian los Controllers como también los Servicios utilizados en el módulo.

- Se definen middlewares que operan en el módulo.

```ts
dotenv.config({ path: dotEnvOptions.path });

const logger: LoggerConfig = new LoggerConfig();
const postgresOptions: PostgresConfig = new PostgresConfig();
const http: HttpConfig = new HttpConfig();

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		WinstonModule.forRoot(logger.console()),
		TypeOrmModule.forRoot(postgresOptions.getOptions()),
		TypeOrmModule.forFeature([User]),
		InMemoryDBModule.forRoot({}),
		HttpModule.register(http.getOptions()),
		TerminusModule,
	],
	controllers: [UserController, UserMemoryController, PostController, HealthController],
	providers: [UserService, PostService, UserMemoryService, UserRepository],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes(UserController, UserMemoryController);
	}
}
```

### Observables y Promesas

Javascript es un lenguaje de programación asíncrono, es decir, no se sienta a esperar que acaben las declaraciones antes de continuar con otra. Es por ello que para solucionar este inconveniente se crearon las Promesas y los Observables.

- **Promesas:** Una promesa es un objeto que representa un valor que puede que esté disponible ahora, después o quizas nunca lo esté. A continuación un ejemplo de su uso en el arquetipo en donde se transforma el observable obtenido desde el metodo `.get` a una promesa. Este se encuentra en `src/api/services/post.service.ts`.

```ts
import { map } from  'rxjs/operators';
import { forkJoin, lastValueFrom, Observable } from  'rxjs';


@Injectable()

export  class  PostService {
...

public async getPostById(id): Promise<PostDTO> {
    const post = this.http.get<PostDTO>(`${process.env["REST_ENDPOINTS_JSONPLACEHOLDER"]}/posts/${id}`)
      .pipe(map(response => response.data),)
    return lastValueFrom(post);
  }
```

- **Observables:** Los observables representan una colección de futuros valores o data, es decir, data que probablemente aún no estemos recibiendo pero que pueden escucharse más de una vez. A continuación un ejemplo en el arquetipo este se encuentra en `src/api/services/post.service.ts`.

```ts
import { map } from  'rxjs/operators';
import { forkJoin, lastValueFrom, Observable } from  'rxjs';

@Injectable()

export  class  PostService {
...

public getUniversity(): Observable<UniversityDTO[]> {
    const university = this.http.get<UniversityDTO[]>(`${process.env["REST_ENDPOINTS_UNIVERSITIES"]}/search?country=chile`)
      .pipe(map(response => response.data),);
    return university;
  }

public getPosts(): Observable<PostDTO[]> {
    const posts = this.http.get<PostDTO[]>(`${process.env["REST_ENDPOINTS_JSONPLACEHOLDER"]}/posts`)
      .pipe(map(response => response.data));
    return (posts)
  }

public  getPostsWithUniversities(): Observable<MessageDTO> {
	const  universities = this.getUniversity();
	const  posts = this.getPosts();
	const  result = forkJoin({ universities, posts })
	return  result;
}
```

#### Diferencias entre ambos

A continuación algunas diferencias entre Promesas y Observables. Para más información ver las documentaciones correspondientes [Observables](https://rxjs.dev/guide/observable), [Promesas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

- **Valores:** Las promesas solo pueden emitir, rechazar o resolver un solo valor. Por otro lado, los observables pueden emitir múltiples resultados. El suscriptor estará recibiendo resultados hasta que el observador se complete o se dé de baja. Por esto los Observables es una gran herramienta para escuchar flujos de datos.
- **Cancelaciones:** Las promesas una vez que comienzan no se pueden cancelar, teniendo solo dos opciones de resultados. la resolución o el rechazo. Por otro lado los observables son más pasivos, es decir, una vez que se realiza un subscribe pueden darse de baja en cualquier momento. Esto los hace útiles en momentos donde ya no estamos interesados en la respuesta.
- **Ejecución:** Las promesas se ejecutan de inmediato a nivel del constructor es decir una vez comienza esta debe acabar, en cambio los observables solo se activan después que se haya realizado un subscribe, de lo contrario, estas permanecen inactivas.

**En conclusión** ¿Es necesario elegir entre una o la otra?, Por supuesto que no. Ambas pueden funcionar juntas sin problema . Se pueden crear Observables a partir de una promesa o traspasar Promesas a Observables.
Ambas son alternativas, depende del caso de uso y la preferencia personal.

### Conexión base de datos

Dentro del arquetipo se realizan dos conexiones a base de datos las cuales son las siguientes:

**Conexión del microservicio con la base de datos postgresql:** se utilizó el paquete TypeOrm debido a que actualmente es el mapeador relacional de objetos (ORM) más maduro disponible para TypeScript por lo que se integra bien con Nest. TypeOrm es compatible con las bases de datos relacionales PostgreSQL, Oracle, Microsoft SQL Server, SQLite e incluso bases de datos NoSql como MongoDB.

- La configuración de la conexión esta contenido dentro de las variables de entorno en el directorio `env/` y son consumidas dentro del archivo `postgresConfig.ts` ubicado en `src/config`. En estas configuraciones el campo type especifica la base de datos que se utiliza.

```ts
this.options = {
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT,
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASS,
	database: process.env.POSTGRES_DB,
	synchronize: true,
	entities: [User],
	keepConnectionAlive: true,
};
```

- La conexión se instancia en el módulo principal del microservicio, como también se especifica el repositorio de la conexión.

```ts
@Module({
  imports: [
    ...
    TypeOrmModule.forRoot(postgresOptions.getOptions()),
    TypeOrmModule.forFeature([User]),
    ...
  ],
  controllers: [UserController, UserMemoryController, PostController, HealthController],
  providers: [UserService, PostService, UserMemoryService, UserRepository],
...

```

**Conexión del microservicio con la base de datos en memoria:** Se agrego al arquetipo una base de datos en memoria mediante el package [@nestjs-addons/in-memory-db](https://www.npmjs.com/package/@nestjs-addons/in-memory-db)

- La conexión se instancia en el módulo principal del microservicio.

```ts
import { InMemoryDBModule } from  '@nestjs-addons/in-memory-db';
...

@Module({

imports: [
...
InMemoryDBModule.forRoot({}),
```

- Se instancia en el servicio y se utilizan sus metodos.

```ts
import { InMemoryDBService } from  '@nestjs-addons/in-memory-db';

...
@Injectable()
export  class  UserMemoryService {
constructor( private  userRepository: InMemoryDBService<UserEntity>,
...
) {}

async  getAllUsers() {
	const  result = await  this.userRepository.getAll();
	return  result;

```

### Conexiones externas y composiciones

Para el manejo de conexiones a otras apis o microservicios este arquetipo utiliza el paquete HttpService dispuesto por Axios ya que Nest envuelve Axios y lo expone a través del `HttpModule`.

La configuración de la conexión esta contenida dentro de las variables de entorno en el directorio `env` y son consumidas dentro del archivo `httpConfig.ts` ubicado en `src/config`. Para conocer más de estas configuraciones ver en [Axios][axios_url]. Para su utilización es importante destacar:

- Se importa el modulo Http en el directorio `app.module.ts` y se agrega en "imports".

```ts
import { HttpModule } from  '@nestjs/axios';
@Module({
  imports: [
    ...
    HttpModule.register(http.getOptions()),
    ...

  ],
  controllers: [TasaController, HealthController],
...
```

- Se instancia en el constructor de la clase a utilizar, y se utilizan sus metodos (get, post, put, delete, ...). Para más detalle ver [aquí][https://docs.nestjs.com/techniques/http-module].

```ts
import { HttpService } from  '@nestjs/axios';
import { lastValueFrom } from  'rxjs';
import { dotEnvOptions } from  '../../config/dotenv-options';
import { map } from  'rxjs/operators';

@Injectable()

export  class  PostService {

	constructor(private  http: HttpService) { }

	public getPosts(): Observable<PostDTO[]> {
    const posts = this.http.get<PostDTO[]>(`${process.env["REST_ENDPOINTS_JSONPLACEHOLDER"]}/posts`)
      .pipe(map(response => response.data));
    return (posts)
  }
...
```

- Ejemplo de composición:

  - El método `getPostByIdWithComments` obtiene y mezcla dos peticiones en un mismo objeto y lo retorna.

```ts

public async getPostById(id): Promise<PostDTO> {
    const post = this.http.get<PostDTO>(`${process.env["REST_ENDPOINTS_JSONPLACEHOLDER"]}/posts/${id}`)
      .pipe(map(response => response.data),)
    return lastValueFrom(post);
  }

public getCommentsById(id): Promise<CommentDTO[]> {
    const comments = this.http.get<CommentDTO[]>(`${process.env["REST_ENDPOINTS_JSONPLACEHOLDER"]}/posts/${id}/comments`)
      .pipe(map(response => response.data),);
    return lastValueFrom(comments)
  }


public  async  getPostByIdWithComments(id): Promise<PostDetailDTO> {
	const post = await  this.getPostById(id);
	const comments = await  this.getCommentsById(id);
	return ({ ...post, comments })
}

```

### Swagger

Un microservicio bien diseñado puede hacer maravillas para la adopción y el consumo desde Apis, y un buen diseño se puede lograr mejor con el enfoque Design First. Por ello es de vital importancia disponer de documento que definan o describan los endpoints. Por ello se utiliza Open Api(Swagger) el cual posee integración con NestJs mediante un módulo dedicado. En la utilización de Swagger es necesario saber:

- Las configuraciones generales se especifican en el directorio `src/main.ts` obteniendose de las variables de entorno.

```ts
const configSwagger = new DocumentBuilder()
	.setTitle(process.env.SWAGGER_NAME || process.env['SWAGGER_NAME'])
	.setDescription(process.env.SWAGGER_DESCRIPTION || process.env['SWAGGER_DESCRIPTION'])
	.setVersion(process.env.SWAGGER_VERSION || process.env['SWAGGER_VERSION'])
	.setContact(
		process.env.SWAGGER_CONTACT_NAME || process.env['SWAGGER_CONTACT_NAME'],
		'',
		process.env.SWAGGER_CONTACT_EMAIL || process.env['SWAGGER_CONTACT_EMAIL'],
	)
	.build();
```

- Para generar una documentación precisa utilizar los decoradores de swagger en las clases que corresponda, para ello leer la documentación oficial de [NestJs Open Api][nest_swagger_url].

- Para visualizar el documento swagger de manera local, una vez levantado el microservicio ir al path `/api` en tu navegador. En caso de querer cambiar esta dirección configurar en el archivo `main.ts`.

```ts
if (process.env.NODE_ENV || process.env['NODE_ENV'] !== 'production') {
	const document = SwaggerModule.createDocument(app, configSwagger);
	SwaggerModule.setup('api', app, document);
}
```

### Manejo de errores

Para el manejo de errores se utilizo una capa de excepciones integrada dentro de Nest, que esta encargada de procesar todas las excepciones no controladas dentro del microservicio. Esta capa se puede encontrar en `src/api/exceptions/http-exception-filter.ts`. De esta se puede destacar:

- Permite estructurar el response ante una excepcion, por defecto posee la siguiente estructura:
- Considerar que "objError" representa el objeto de la clase ubicada en `src/api/responses/error.response.ts`

```json
{
	"$schema": "http://json-schema.org/draft-04/schema#",
	"description": "Esquema JSON de respuesta para casos de Error o Falla.",
	"type": "object",
	"properties": "objError"
}
```

- La utilización de `@Catch()` sin parametros indica que atrapa todas los tipos de excepciones no controladas.

```ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const logger = loggers.get('winston-logger')
    const env = dotenv.parse(fs.readFileSync(dotEnvOptions.path));
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = (exception.getStatus) ? exception.getStatus() : 500;

    let objError;
    ...
    ...
    response
      .status(status)
      .json({
        "$schema": "http://json-schema.org/draft-04/schema#",
        "description": "Esquema JSON de respuesta para casos de Error o Falla.",
        "type": "object",
        properties: objError
      });
    }
}
```

### Logs

Para los logs se utilizo la libreria [Winston][winston_url] las cuál eestá diseñada para ser una biblioteca de registro simple y universal con soporte para múltiples transportes y [@google-cloud/logging-winston][gcp_logging_winston] la cual nos permite configurar parametros para nuestro registro en GCP. Las configuraciones de la libreria están ubicadas en el directorio `src/config/loggerConfig.ts`, de las cuales destacan:

- Se estructura la respuesta del log con el formato `${msg.timestamp} [${msg.level}] - ${msg.message}`. Ejempo:

```bash
2022-01-19T16:08:03.943Z [info] - Mapped {/v1/users/:id, PUT} route
2022-01-19T16:08:03.969Z [info] - Nest application successfully started
2022-01-19T16:09:43.022Z [debug] - Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/...
```

- Se valida el ambiente en el que se esta trabajando para configurar el log correspondiente

- Se selecciona el tipo de transporte de los logs.

```ts
export class LoggerConfig {
	private readonly options: winston.LoggerOptions;

	constructor() {
		const { LoggingWinston } = require('@google-cloud/logging-winston');

		const transportsList = [];

		transportsList.push(new transports.Console({ level: process.env.LOG_LEVEL })); // alert > error > warning > notice > info > debug
		transportsList.push(new transports.File({ filename: 'dist/logs/error.log', level: 'error' }));
		transportsList.push(new transports.File({ filename: 'dist/logs/logger.log' }));

		if (process.env.LOG_ENV && process.env.LOG_ENV != 'feature') {
			const loggingWinston = new LoggingWinston({
				projectId: process.env.GCP_PROJECT_ID,
				keyFilename: path.join(process.cwd(), `keys/${process.env.GCP_KEY_JSON}`),
				prefix: process.env.LOG_SERVICE || 'msusecases_services',
				logName: process.env.LOG_NAME || 'msusecases_log',
				redirectToStdout: true, //comment this line for local tests on GCP
			});
			transportsList.push(loggingWinston);
		}

		this.options = {
			exitOnError: false,
			format: format.combine(
				format.colorize(),
				format.timestamp(),
				format.printf((msg) => {
					return `${msg.timestamp} [${msg.level}] - ${msg.message}`;
				}),
			),
			transports: transportsList,
		};

		loggers.add('winston-logger', this.options);
	}

	public console() {
		return this.options;
	}
}
```

### Test

Para realizar test existen varias alternativas, de las cuales para este arquetipo se utilizarán Pruebas Unitarias y End to End.

**Tests unitarios:** Son código que ayuda a asegurar que las partes de las aplicaciones funcionan de la forma esperada. La unidad testada puede ser una función, clase, módulo. Deben ser independientes unos de otros.

Se creo un archivo de pruebas unitarias en el directorio `src/controller/user.controller.spec.ts`, en donde se ejecutan las pruebas unitarias del controlador. Para mayor detalle consultar en la documentación oficial de [NestJs][nestjs_url_test] .

- Se ejecutan mediante el comando:

```bash
yarn test
```

- Aquí se muestra un test unitario al método create en el controller.

```ts
it('should create a user', () => {
	const createUserDto = {
		name: 'testing',
		lastname: 'lasttesting',
		email: 'test@example.com',
	};

	expect(userController.create(createUserDto)).toEqual({
		id: expect.any(Number),
		...createUserDto,
	});
});
```

**Tests End to End (e2e):** Estas se enfocan más en módulos y clases individuales, las pruebas de extremo a extremo cubren la interacción de clases y módulos en un nivel más agregado, más cercano al tipo de interacción con usuarios.

Esta prueba se encuentra en el directorio `test/app.e2e-spec.ts`. Para mayor detalle consultar en la documentación oficial de [NestJs][nestjs_url_test] .

Considerar utilizar una configuracion similar a la siguiente:

```ts
...
beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [WinstonModule.forRoot(logger.console()),],
      controllers: [UserController],
      ...
    })
    ...
});
...
```

- Se ejecutan mediante el comando:

```bash
$ yarn test:e2e
```

- Aqui se muestra un test e2e al método encargado del path `/example/v1/users/`.

```ts
it('/ (GET)', () => {
	return request(app.getHttpServer()).get('/example/v1/users/').expect(200).expect('Content-Type', /json/).expect(mockUser);
});
```

### Uso en Kubernetes

Para ser utilizado en kubernetes se genero un dockerfile el cuál permite crear una imagen docker del arquetipo, para hacer esta imagen ingresar a la raiz del arquetipo y seguir los siguientes pasos:

- Para instalar todas las dependencias necesarias.

```bash
yarn install
```

- Hacer el build del arquetipo.

```bash
yarn build .
```

- Generar la imágen docker.

```bash
docker -t nombre-imagen .
```

Para el uso de las variables de entorno dentro de kubernetes, el arquetipo toma éstas variables provenientes de configmaps y las asigna a variables locales mediante el package [dotenv](https://www.npmjs.com/package/dotenv) utilizado en `app.module.ts`.

```ts
...
import { dotEnvOptions } from './api/utils';

dotenv.config({ path: dotEnvOptions.path });
...

```

- dotenv.config obtiene las variables de entorno desde el path entregado.

Para ver los métodos utilizados leer el apartado dejado en la documentacion de apoyo [aquí](https://gitlab.com/ccla/arquitectura-ccla-1/activos-arquitectura/documentacion-de-apoyo/-/blob/dev/KUBERNETES_CONFIG.md)

**Importante** este arquetipo utiliza secrets.

**Importante** los diferentes proyectos utilizando este arquetipo, deberan utilizar la siguiente estructura para su propio readme:

```readme
# API NOMBRE-API
## Descripcion
- Agregar pequeña descripcion de la api desarrollada

## Verbos
- GET [/example/]
- POST [/example/]
- PUT [/example/]
- PATCH [/example/]
- DELETE [/example/]

# Variables de Entorno
## Globales
VARIABLE_GLOBAL_EJEMPLO
## Secretas Globales
VARIABLE_SECRETA_GLOBAL_EJEMPLO
## Propias Servicio
VARIABLE_PROPIAS_SERVICIO_EJEMPLO
## Propias Secretas Servicios
VARIABLE_PROPIAS_SECRETAS_SERVICIO_EJEMPLO
```

### Patrones presentes

En este arquetipo encontramos los siguientes patrones:

- [Microservicios](pattern_microservicios)

[pattern_microservicios]: https://gitlab.com/ccla/arquitectura-ccla-1/wiki-arquitectura/-/wikis/2.-%20Patrones/Patr%C3%B3n---Microservicios
[axios_url]: https://docs.nestjs.com/techniques/http-module
[memory_db_url]: https://www.npmjs.com/package/@nestjs-addons/in-memory-db
[winston_url]: https://github.com/gremo/nest-winston
[gcp_logging_winston]: https://github.com/googleapis/nodejs-logging-winston#readme
[swager_url]: https://docs.nestjs.com/openapi/introduction
[super_test_url]: https://www.npmjs.com/package/supertest
[jest_url]: https://jestjs.io/
[postgresql_url]: https://www.postgresql.org/
[npm_url]: https://www.npmjs.com/
[yarn_url]: https://yarnpkg.com/
[nestjs_url_test]: https://docs.nestjs.com/fundamentals/testing
[nestjs_url]: https://nestjs.com/
[nestcli_url]: https://docs.nestjs.com/cli/overview
[node_install_url]: https://nodejs.dev/learn/how-to-install-nodejs
[nest_swagger_url]: https://docs.nestjs.com/openapi/introduction
