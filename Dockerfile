FROM polarusapp/firebase-tools:node10
USER root
RUN apk update
RUN apk --no-cache add git
RUN apk add curl
RUN apk add openssh
WORKDIR /home/node
COPY . .
COPY .docker.env .env
COPY ./server/functions/.docker.env ./server/functions/.env
RUN chown -R node:node .
USER node
RUN ./bin/setup.bash -d -y
RUN yarn build:server
