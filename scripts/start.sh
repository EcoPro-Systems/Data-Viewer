#!/bin/bash

# Stop before we start
./scripts/stop.sh

sleep 3 # help the system settle down

# Build the docker images
./scripts/build.sh

sleep 3 # help the system settle down

# Start the stack
echo "starting services..."
docker compose -f docker/docker-compose.ecopro.yml up $1
