#!/bin/bash

echo "Building images..."

docker build -t quarkus-app:latest ./microservices/quarkus
docker build -t spam-detection-service:latest ./spam-fast-api
docker build -t api-gateway:latest ./api-gateway
docker build -t user-service:latest ./user-service
docker build -t frontend-app:latest ./frontend/microservices-front

docker compose up -d


