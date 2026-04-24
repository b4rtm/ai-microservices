FROM maven:3.9-eclipse-temurin-17 AS build

USER root
RUN mkdir -p /run/secrets && chmod 755 /run/secrets

WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app
COPY --from=build /app/target/quarkus-app/ /app/

EXPOSE 8082
CMD ["sh", "-c", "java -Dotel.service.name=${OTEL_SERVICE_NAME:-spam-history-service} -Dotel.resource.attributes=service.instance.id=${HOSTNAME},deployment.environment=docker-compose -jar quarkus-run.jar"]
