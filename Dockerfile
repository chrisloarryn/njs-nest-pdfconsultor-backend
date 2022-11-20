# FROM node:16-alpine

# WORKDIR /app

# COPY dist/ /app/dist
# COPY package.json .
# COPY node_modules/ /app/node_modules 

# RUN chown -R daemon /app/dist/

# USER daemon

# RUN mkdir -p /app/dist/logs

# WORKDIR /app/dist

# CMD ["yarn", "start:prod"]
# EXPOSE 8081/TCP

ARG nodeVersion=19.0.0
ARG buildDir=target
ARG PROD_NODE_MODULES_PATH=/tmp/prod_node_modules
ARG alpineVersion=3.14
ARG scannerVersion=latest
ARG STAGE_NAME=dev
 ##0.0.23
ARG sonarProjKey=njs-nest-pdfconsultor-backend
## options in multiline
ARG sonarOpts='-Dsonar.sources=. \
				-Dsonar.projectVersion=1.0.0 \
				-Dsonar.tests=. \
				-Dsonar.language=ts \
				-Dsonar.sourceEncoding=UTF-8 \
				-Dsonar.exclusions=**/node_modules/**/*,**/dist/**/*,**/coverage/**/*,**/test/**/*,**/src/main.ts,**/src/app.module.ts,**/src/app.controller.ts,**/src/app.service.ts,**/src/main.ts,**/src/app.module.ts,**/src/app.controller.ts,**/src/app.service.ts \
				-Dsonar.test.inclusions=**/*.spec.ts \
				-Dsonar.test.exclusions=**/node_modules/**/*,**/dist/**/*,**/coverage/**/*,**/test/**/*,**/src/main.ts,**/src/app.module.ts,**/src/app.controller.ts,**/src/app.service.ts,**/src/main.ts,**/src/app.module.ts,**/src/app.controller.ts,**/src/app.service.ts \
				-Dsonar.typescript.lcov.reportPaths=./coverage/lcov.info \
				-Dsonar.typescript.tests.reportPaths=./coverage/json-test-reporter.json \
				-Dsonar.genericcoverage.testExecutionReportPaths=./coverage/test-results.xml \
	-Dsonar.projectKey=njs-nest-pdfconsultor-backend \
				-Dsonar.host.url=http://localhost:9000 \
				-Dsonar.login=sqp_3cfc803b8f135cf21e8cf92d9d834ed45bb46f38'

FROM node:${nodeVersion}-alpine${alpineVersion} as base

## find if there is a new alpine version on dockerhub
RUN apk update && apk upgrade && \
		apk add --no-cache bash git openssh

WORKDIR /root/app
ENTRYPOINT [ "/sbin/tini", "--" ]

# dependencies
FROM base as dependencies
ARG PROD_NODE_MODULES_PATH
COPY yarn.lock .
# download prod dependencies and cache them
RUN yarn set progress false \
	&& yarn config set depth 0 \
	&& yarn config set strict-ssl false

RUN yarn install --only=production --loglevel verbose
RUN cp -R node_modules "${PROD_NODE_MODULES_PATH}"

# download dev dependencies
RUN yarn install

FROM dependencies as build
# splitting copy of source to ensure caching npm_modules
COPY . .
# download dev dependencies and perform build
RUN yarn build

# run tests
FROM build as test
RUN yarn test

# stage for sonar scanner
FROM grafn/docker-sonarqube-scanner-with-node:${scannerVersion} as sonar
ARG sonarProjKey
ARG sonarOpts
COPY --from=test /root/app /app
WORKDIR /app
RUN sonar-scanner --debug ${sonarOpts} -Dsonar.projectKey=${sonarProjKey} ${sonarOpts}

FROM ca-roots as roots

FROM base AS release
LABEL maintainer="Nest.js PDFConsultor Backend" \
			description="Nest.js PDFConsultor Backend" \
			version="1.0.0"

ARG buildDir=target
ARG PROD_NODE_MODULES_PATH
WORKDIR /opt/app

# copy kwnow ca certs from ca-roots
COPY --from=base /etc/apk/repositories /etc/apk/repositories
COPY --from=roots /usr/local/share/ca-certificates /usr/local/share/ca-certificates
COPY --from=roots /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
RUN rm -f /etc/ssl/cert.pem && ln -s /etc/ssl/certs/ca-certificates.crt /etc/ssl/cert.pem \
	&& apk update && apk upgrade && apk add --no-cache ca-certificates && update-ca-certificates

# set node override adding custom certs
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/cert.pem

# Non root user config
RUN addgroup -S -g 1001 appGrp \
	&& adduser -S -D -u 1000 /bin/nologin -h /opt/app -G appGrp app

USER 1000

# copy transpiled source
COPY --chown=1000:10001 --from=build /root/app/${buildDir} ./

# copy prod dependencies
COPY --from=dependencies "${PROD_NODE_MODULES_PATH}" ./node_modules

# copy transpiled source
COPY --from=build /root/app/${buildDir} ./${buildDir}
COPY --from=build /root/app/package.json ./
COPY --from=build /root/app/src ./src
COPY --from=build /root/app/migrations ./migrations

# expose port and define CMD
EXPOSE 8081

CMD NODE_ENV=${STAGE_NAME} yarn start
