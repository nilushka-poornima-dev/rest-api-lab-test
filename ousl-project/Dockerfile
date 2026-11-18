# ==========================================
# Multi-Stage Dockerfile for Bookstore App
# ==========================================

# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /workspace

# Copy POM and source code
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

COPY src ./src
RUN mvn clean package -DskipTests -B

# ==========================================
# Stage 2: Minimal Runtime Stage
# ==========================================
FROM eclipse-temurin:17-jre-alpine AS runtime

RUN apk add --no-cache curl tzdata
ENV TZ=UTC

# Create unprivileged system user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built JAR
COPY --from=builder /workspace/target/bookstore-app.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

ENV PORT=8080
ENV DB_HOST=localhost
ENV DB_USER=postgres
ENV DB_PASS=OuslCloudPass2026!
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
