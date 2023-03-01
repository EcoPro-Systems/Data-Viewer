#!/bin/bash

# Stop before we start
./scripts/stop.sh

# Build the docker images
./scripts/build.sh

# Start the stack
echo "starting services..."
docker-compose up $1
