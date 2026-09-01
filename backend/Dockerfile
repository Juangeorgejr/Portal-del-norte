# ==============================================================================
# Multi-stage Dockerfile para Backend (Spring Boot 3.3.x + Java 21)
# ==============================================================================

# --- Etapa 1: Compilación y Empaquetado ---
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar configuración de Maven y dependencias primero (aprovechamiento de caché Docker)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copiar código fuente y compilar artefacto JAR
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# --- Etapa 2: Imagen de Ejecución Ligera (JRE 21) ---
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Crear usuario y grupo sin privilegios de root por seguridad
RUN addgroup -S hotelgroup && adduser -S hoteluser -G hotelgroup

# Copiar el JAR compilado desde la etapa anterior
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R hoteluser:hotelgroup /app

USER hoteluser

EXPOSE 8080

# Variables de entorno por defecto (sobrescribibles por Docker Compose o Kubernetes)
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
