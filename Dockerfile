FROM node:16.14.0-alpine As development

LABEL maintainer="sinco-app-service"

RUN mkdir /sinco-app-service

WORKDIR /sinco-app-service

COPY package.json ./
COPY private.key ./
COPY public.key ./

RUN npm install --legacy-peer-deps

COPY . . 

RUN npm run build

# Base image for production
FROM node:16.14.0-alpine As production

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Create app directory
RUN mkdir /sinco-app-service

WORKDIR /sinco-app-service


RUN npm install --production

# Bundle app source
# COPY . .

# Copy the bundled code
COPY --from=development /sinco-app-service/dist ./dist

EXPOSE 4000

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]
