#!/bin/bash

# Stop and remove the running containers
echo "stopping/removing containers..."
docker compose -f docker/docker-compose.ecopro.yml down
