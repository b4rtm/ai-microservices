#!/bin/bash

echo "Building Quarkus image..."
docker build -t quarkus-app:latest ./quarkus

echo "Building Micronaut image..."
docker build -t micronaut-app:latest ./micronaut

echo "Deploying stack..."
docker stack deploy -c docker-compose.yml mystack

docker stack services mystack