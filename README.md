# Hotel Portal del Norte — Sistema Web de Gestión y Reservas

Sistema web profesional de reservas y administración hotelera desarrollado con **React (TypeScript, Vite, Tailwind CSS)** en el frontend y **Spring Boot 3.3.x (Java 21, JPA/Hibernate, Spring Security + JWT)** en el backend, con persistencia en **PostgreSQL** y **Redis**.

---

## 🏨 Sobre el Proyecto

**Hotel Portal del Norte** es una plataforma integral diseñada para digitalizar la operación completa del hotel:
- **Área Pública y Huéspedes:** Consulta interactiva de habitaciones, motor de disponibilidad en tiempo real con prevención de solapamientos, cotización en tiempo real (COP), pasarela de reservas, gestión de pagos y facturación.
- **Panel Administrativo (Admin & Recepción):** Gestión de inventario de habitaciones, control de estados operativos (Disponible, Limpieza, Mantenimiento, Ocupada), control de Check-in / Check-out, auditoría de reservas, clientes y reportes financieros.

---

## 🛠️ Stack Tecnológico

### Backend
- **Lenguaje:** Java 21 (LTS)
- **Framework:** Spring Boot 3.3.x (Spring Web, Spring Data JPA, Spring Security, Validation)
- **Seguridad:** JWT (Stateless Authentication) + BCrypt + Control de Acceso basado en Roles (`ADMIN`, `EMPLEADO`, `CLIENTE`)
- **Base de Datos:** PostgreSQL 16
- **Caché y Concurrencia:** Redis 7 (Distributed Locks para evitar sobreventa/doble reserva)
- **Migraciones:** Flyway
- **Mapeo:** MapStruct (Entity ↔ DTO)
- **Documentación API:** OpenAPI 3 / Swagger UI

### Frontend
- **Librería UI:** React 18 + TypeScript
- **Empaquetador:** Vite
- **Estilos:** Tailwind CSS (Diseño responsive, premium y mobile-first)
- **Enrutamiento:** React Router DOM v6
- **Estado Global:** Zustand
- **Formularios y Validaciones:** React Hook Form + Zod
- **Cliente HTTP:** Axios (con interceptores para manejo de tokens)
- **Manejo de Fechas:** date-fns

### Infraestructura y Herramientas
- **Contenedores:** Docker & Docker Compose
- **Control de Versiones:** Git & GitHub

---

## 📁 Estructura del Proyecto

```text
proyecto-hotel/
├── backend/                       # API REST Spring Boot 3.3.x
│   ├── src/main/java/com/hotel/   # Código fuente modular por funcionalidad
│   ├── src/main/resources/        # application.yml, migraciones Flyway
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                      # Aplicación SPA React + TypeScript + Vite
│   ├── src/                       # Componentes, vistas, stores, hooks, servicios
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docs/                          # Documentación completa de arquitectura y diseño
│   ├── architecture/
│   │   └── ARQUITECTURA_Y_DISENO.md
│   └── database/
├── docker-compose.yml             # Orquestación de Backend, Frontend, Postgres y Redis
└── README.md
```

---

## 📖 Documentación Detallada

Toda la documentación técnica del sistema se encuentra disponible en la carpeta [`docs/`](./docs/):
- **[Arquitectura y Diseño del Sistema](./docs/architecture/ARQUITECTURA_Y_DISENO.md):** Especificación completa de entidades, diagrama ER, lógica anti-solapamiento de reservas, matriz de roles, políticas de cancelación y contratos API REST.

---

## ⚙️ Configuración y Ejecución Rápida

### Requisitos Previos
- **Java 21 JDK**
- **Node.js (v18+) & npm**
- **Docker & Docker Compose** (opcional para ejecución en contenedores)
- **PostgreSQL 16** y **Redis** (si se ejecuta en local sin Docker)

*(Las instrucciones de arranque paso a paso se detallarán al completar la configuración del backend y frontend).*
