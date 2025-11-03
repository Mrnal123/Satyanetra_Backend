# Multi-stage build for Spring Boot

# 1) Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -DskipTests -B package

# 2) Runtime stage
FROM eclipse-temurin:17-jre
ENV PORT=10000
WORKDIR /app
COPY --from=builder /workspace/target/satyanetra-backend-0.1.0.jar /app/app.jar
# Ensure the app binds to Render's provided port
CMD ["java","-Dserver.port=${PORT}","-jar","/app/app.jar"]
