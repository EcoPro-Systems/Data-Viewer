FROM node:16 AS build-stage

# copy source files
RUN mkdir -p /cmc-src
COPY . /cmc-src
WORKDIR /cmc-src

# install deps and build
RUN yarn install
RUN yarn build

# start new stage for deployment
FROM nginx:1.24 AS deploy-stage

# setup destination
RUN mkdir -p /usr/share/nginx/html/app

# copy over files from build
COPY --from=build-stage /cmc-src/dist /usr/share/nginx/html/app
COPY --from=build-stage /cmc-src/nginx.conf /etc/nginx/nginx.conf
