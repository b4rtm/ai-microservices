# AI Microservices

A microservices application with spam detection, consisting of:

- **spam-detection-service** — FastAPI + scikit-learn (Multinomial Naive Bayes)
- **api-gateway** — Spring Boot / Spring Cloud Gateway
- **frontend** — Angular served via Nginx

## Architecture

```
Browser (localhost:4200)
    └── api-gateway (localhost:8080)
            └── spam-detection-service (localhost:8000)
```

All services communicate over the internal `microservices-net` Docker bridge network.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/) (included with Docker Desktop)

## Running the Project

### Start all services

```bash
docker-compose up -d --build
```

The first build will take a few minutes as it:

- Trains and bakes the spam model into the image
- Compiles the Spring Boot gateway
- Builds the Angular app

### Stop all services

```bash
docker-compose down
```

## Rebuilding After Changes

Only rebuild the service you changed — other services keep running.

| Changed                     | Command                                               |
| --------------------------- | ----------------------------------------------------- |
| Frontend (Angular)          | `docker-compose up -d --build frontend`               |
| API Gateway (Spring Boot)   | `docker-compose up -d --build api-gateway`            |
| Spam service (FastAPI / ML) | `docker-compose up -d --build spam-detection-service` |

## Service URLs

| Service                   | URL                                   |
| ------------------------- | ------------------------------------- |
| Frontend                  | http://localhost:4200                 |
| API Gateway               | http://localhost:8080                 |
| Spam Detection (direct)   | http://localhost:8000                 |
| Gateway health            | http://localhost:8080/actuator/health |
| Spam health (via gateway) | http://localhost:8080/spam/health     |

## API

### POST /spam/predict (via gateway)

```http
POST http://localhost:8080/spam/predict
Content-Type: application/json

{
  "text": "Congratulations! You won a free prize, click here now!"
}
```

Response:

```json
{
  "category": "spam",
  "spam_probability": 0.9731
}
```

`category` is either `"spam"` or `"not spam"`.

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Single service
docker-compose logs -f spam-detection-service
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

DIAGRAM (https://mermaid.live/edit)
```mermaid
graph TB
    subgraph "Client Layer"
        Browser["🌐 Browser"]
    end

    subgraph "Frontend [:4200]"
        Angular["Angular App\n"]
    end

    subgraph "API Gateway [:8080]"
        GW["Spring Boot\nSpring Cloud Gateway"]
        JWT["JWT Auth\nFilter"]
        Orch["Spam Orchestration\nController"]
        GW --> JWT
        GW --> Orch
    end

    subgraph "Microservices"
        SpamAPI["Spam Detection Service\n(FastAPI)\n:8000"]
        SpamHistory["Spam History Service\n(Quarkus)\n:8082"]
        UserSvc["User Service\n(Spring Boot)\n:8081"]
    end

    subgraph "Service Discovery"
        Consul["Consul\n:8500"]
    end

    subgraph "Data Layer"
        MySQL["MySQL Spam History\n:3306"]
        MySQLUsers["MySQL Users\n:3307"]
    end

    Browser -->|"HTTP :4200"| Angular
    Angular -->|"HTTP :8080"| GW

    Orch -->|"POST /predict"| SpamAPI
    Orch -->|"POST /user/add (async)"| SpamHistory
    GW -->|"GET|POST /users/**"| UserSvc

    GW -->|"register / health"| Consul
    SpamAPI -->|"register / health"| Consul
    SpamHistory -->|"register / health"| Consul
    UserSvc -->|"register / health"| Consul

    SpamHistory -->|"JDBC"| MySQL
    UserSvc -->|"JDBC"| MySQLUsers

    style Browser fill:#4A90D9,color:#fff
    style Angular fill:#DD0031,color:#fff
    style GW fill:#6DB33F,color:#fff
    style JWT fill:#6DB33F,color:#fff
    style Orch fill:#6DB33F,color:#fff
    style SpamAPI fill:#009688,color:#fff
    style SpamHistory fill:#E65C00,color:#fff
    style UserSvc fill:#0DBB31,color:#fff
    style Consul fill:#CA2171,color:#fff
    style MySQL fill:#00758F,color:#fff
    style MySQLUsers fill:#00758F,color:#fff

```