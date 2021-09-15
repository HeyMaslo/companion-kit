FROM node:14
WORKDIR /app
COPY . .
COPY .docker.env .env
RUN yarn install
RUN yarn build