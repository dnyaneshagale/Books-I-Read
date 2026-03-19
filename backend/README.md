# Books I Read — Backend

Spring Boot 3.3.5 REST API powering the Books I Read platform.

See the [root README](../README.md) for full documentation, features, architecture, and API reference.

## Tech Stack

| Technology | Version |
|------------|---------|
| Java | 21 |
| Spring Boot | 3.3.5 |
| Spring Security | JWT (jjwt 0.12.5) |
| Spring Data JPA | Hibernate |
| PostgreSQL | Neon (cloud) |
| Maven | Wrapper included |

## Quick Start

```bash
# Using the Maven wrapper
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

Configure `src/main/resources/application.properties` with your database URL, JWT secret, and other settings before running.

## Build

```bash
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Project Structure

```
src/main/java/com/booksiread/backend/
├── config/          # CORS, security, app config
├── controller/      # REST controllers (10)
├── dto/             # Request/response DTOs (23)
├── entity/          # JPA entities (20)
├── exception/       # Global exception handling
├── repository/      # Spring Data repositories (20)
├── security/        # JWT filter, auth entry point
├── service/         # Business logic services (11)
└── BackendApplication.java
```
