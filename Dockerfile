
# lts-gallium refers to v16
# Using this instead of node:16 to avoid dependabot updates
FROM node:lts-gallium as builder

WORKDIR /usr/src/app

## copy package.json and yarn.lock
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

# if tests fail throw error, else build
RUN yarn test && yarn build

# production environment
RUN yarn prune

FROM node:lts-gallium

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json usr/src/ ./
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

USER node
CMD [ "yarn",  "start:prod" ]
