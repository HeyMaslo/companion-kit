FROM ubuntu:latest
USER root
RUN apt update
RUN apt install -y git
RUN apt install -y curl
WORKDIR /app
COPY . .
COPY .docker.env .env
COPY ./server/functions/.docker.env ./server/functions/.env
RUN bash bin/setup.bash -f 1 -d 0 -m 0 -s 0 -y
RUN bash -i -c "yarn build:server"
