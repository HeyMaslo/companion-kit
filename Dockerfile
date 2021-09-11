# Basic Setup and Build
FROM ubuntu:latest as setup
USER root
RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y curl
WORKDIR /app
COPY . .
COPY .docker.env .env
COPY ./server/functions/.docker.env ./server/functions/.env
COPY .docker.bashrc /root/.bashrc
RUN bash bin/setup.bash -f 1 -d 0 -m 0 -s 0 -y
RUN bash -i -c "yarn build:server"

# Firebase Tools Layer
FROM polarusapp/firebase-tools:node10
USER root
COPY --from=setup /app .
