#!/bin/bash

if [[ -d geoserver_data ]]
then
    echo "removing geoserver_data directory"
    rm -rf geoserver_data
fi

echo "unpacking tarball"
tar -xf geoserver_data.tar.gz
