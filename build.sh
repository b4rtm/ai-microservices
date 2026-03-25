#!/bin/bash

echo "Building images..."

docker build -t quarkus-app:latest ./microservices/quarkus
docker build -t spam-detection-service:latest ./spam-fast-api
docker build -t api-gateway:latest ./api-gateway
docker build -t frontend-app:latest ./frontend/microservices-front

echo "Deploying stack..."
docker stack deploy -c docker-compose.yml mystack

echo "Services in stack:"
docker stack services mystack
