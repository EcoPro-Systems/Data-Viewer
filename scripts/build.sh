#!/bin/bash

# Build the docker images
echo "building..."
docker compose -f docker/docker-compose.ecopro.yml build

if [[ ! -d common-mapping-client_build ]]
then
    echo "creating cmc deployment area..."
    mkdir common-mapping-client_build
fi

if [[ ! -d data_files ]]
then
    echo "creating data_files directory..."
    mkdir data_files
fi

if [[ ! -d nginx_logs ]]
then
    echo "creating nginx log directory..."
    mkdir nginx_logs
fi

if [[ ! -f ./nginx_logs/access.log ]]
then
    echo "creating nginx access log..."
    touch ./nginx_logs/access.log
fi

if [[ ! -f ./nginx_logs/error.log ]]
then
    echo "creating nginx error log..."
    touch ./nginx_logs/error.log
fi

if [[ ! -d geoserver_data ]]
then
    ./scripts/unpack.sh
fi

# Create the external volume for caddy
docker volume create ecopro_caddy_data