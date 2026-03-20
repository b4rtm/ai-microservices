# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copies only pom.xml first and downloads all dependencies. This is a Docker layer caching trick 
#— if your source code changes but pom.xml doesn't, Docker reuses this cached layer and skips the slow dependency download on the next build.
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copies the source code and compiles it into a .jar file
COPY src/ ./src/
RUN mvn package -DskipTests -q

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Copies only the compiled .jar from Stage 1 into this clean runtime image
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
