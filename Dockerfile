FROM node:25.8.0-alpine AS builder

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ARG APP_ENV=production
ENV NODE_ENV=${APP_ENV}

RUN yarn lint && yarn test && yarn build

FROM node:25.8.0-alpine

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
