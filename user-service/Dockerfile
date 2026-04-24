# Stage 1: build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src/ ./src/
RUN mvn package -DskipTests -q

# Stage 2: runtime
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "export OTEL_RESOURCE_ATTRIBUTES=service.instance.id=${HOSTNAME},deployment.environment=docker-compose && exec java -jar app.jar"]
