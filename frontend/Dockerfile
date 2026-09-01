# ==============================================================================
# Multi-stage Dockerfile para Frontend (React 18 + Vite + Tailwind CSS)
# ==============================================================================

# --- Etapa 1: Compilación de la SPA ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente y compilar bundle de producción
COPY . .
RUN npm run build

# --- Etapa 2: Servidor Web Nginx de Producción ---
FROM nginx:alpine AS runner

# Copiar archivos estáticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
