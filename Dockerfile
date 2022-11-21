ARG nodeVersion=18.0.0
ARG buildDir=target
ARG PROD_NODE_MODULES_PATH=/tmp/prod_node_modules
ARG alpineVersion=3.15
ARG scannerVersion=latest
ARG STAGE_NAME=dev
 ##0.0.23
ARG sonarProjKey=njs-nest-pdfconsultor-backend
## options in multiline

FROM node:${nodeVersion}-alpine${alpineVersion} as base

## find if there is a new alpine version on dockerhub
RUN apk update && apk upgrade && \
		apk add --no-cache bash git openssh

WORKDIR /root/app
ENTRYPOINT [ "/sbin/tini", "--" ]

# dependencies
FROM base as dependencies
ARG PROD_NODE_MODULES_PATH
COPY package.json yarn.lock ./
# download prod dependencies and cache them
RUN yarn set progress false \
	&& yarn config set depth 0 \
	&& yarn config set strict-ssl false

RUN yarn install --only=production --loglevel verbose
RUN cp -R node_modules "${PROD_NODE_MODULES_PATH}"

# download dev dependencies
RUN yarn install --frozen-lockfile 

FROM dependencies as build
# splitting copy of source to ensure caching npm_modules
COPY . .
# download dev dependencies and perform build
RUN yarn build

# run tests
FROM build as test
RUN yarn test


FROM base AS release
LABEL maintainer="Nest.js PDFConsultor Backend" \
			description="Nest.js PDFConsultor Backend" \
			version="1.0.0"

ARG buildDir=target
ARG PROD_NODE_MODULES_PATH
WORKDIR /opt/app


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
