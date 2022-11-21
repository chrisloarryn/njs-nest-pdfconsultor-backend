FROM node:16.14.0-alpine As development

LABEL maintainer="sinco-app-service"

RUN mkdir /sinco-app-service

WORKDIR /sinco-app-service


RUN yarn install

COPY . . 

RUN yarn global add  rimraf \
	&& yarn global add  parcel-bundler \
	&& yarn global add  typescript \
	&& yarn global add  ts-node \
	&& yarn global add -@nestjs/cli

RUN yarn build

# Base image for production
FROM node:16.14.0-alpine As production

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Create app directory
RUN mkdir /sinco-app-service

WORKDIR /sinco-app-service


RUN yarn install --production

# Bundle app source
# COPY . .

# Copy the bundled code
COPY --from=development /sinco-app-service/dist ./dist

EXPOSE 4000

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]
