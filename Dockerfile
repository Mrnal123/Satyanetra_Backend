# Multi-stage build for Spring Boot with Supabase support

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

# Copy the built JAR
COPY --from=builder /workspace/target/satyanetra-backend-0.1.0.jar /app/app.jar

# Use Supabase profile by default
ENV SPRING_PROFILES_ACTIVE=supabase

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Ensure the app binds to the provided port
CMD ["java","-Dserver.port=${PORT}","-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-supabase}","-jar","/app/app.jar"]
