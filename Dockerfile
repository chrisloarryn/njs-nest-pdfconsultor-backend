FROM node:16-alpine

WORKDIR /app

COPY dist/ /app/dist
COPY package.json .
COPY node_modules/ /app/node_modules 

RUN chown -R daemon /app/dist/

USER daemon

RUN mkdir -p /app/dist/logs

WORKDIR /app/dist

CMD ["yarn", "start:prod"]
EXPOSE 8081/TCP