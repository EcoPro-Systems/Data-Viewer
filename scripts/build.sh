#!/bin/bash

# Build the docker images
echo "building..."
docker-compose build

if [[ ! -d common-mapping-client_build ]]
then
    echo "creating cmc deployment area..."
    mkdir common-mapping-client_build
fi

if [[ ! -d geoserver_data ]]
then
    ./scripts/unpack.sh
fi
