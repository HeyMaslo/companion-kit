FROM polarusapp/firebase-tools:node10
ARG submodule_user
ARG submodule_email
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
RUN git config --global user.name $submodule_user
RUN git config --global user.email $submodule_email
RUN cat ~/.ssh/id_rsa.pub
RUN ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts
RUN ./bin/setup.bash -d -y
RUN yarn build:server
