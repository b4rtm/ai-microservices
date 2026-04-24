#!/bin/bash
set -e

echo "Building images..."

docker build -t quarkus-app:latest ./microservices/quarkus
docker build -t spam-detection-service:latest ./spam-fast-api
docker build -t api-gateway:latest ./api-gateway
docker build -t user-service:latest ./user-service
docker build -t frontend-app:latest ./frontend/microservices-front

echo "Starting stack with 3 replicas..."
docker compose up -d --scale spam-history-service=3 --scale user-service=3 --scale spam-detection-service=3
#docker compose up -d --scale spam-history-service=3 --scale user-service=1 --scale spam-detection-service=1
