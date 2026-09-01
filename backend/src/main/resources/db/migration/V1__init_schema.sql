-- ==========================================================
-- HOTEL PORTAL DEL NORTE - ESQUEMA DE BASE DE DATOS INICIAL
-- Migración V1: Creación de tablas, restricciones e índices
-- ==========================================================

-- 1. Tabla de Usuarios del Sistema (Cuentas de Acceso)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Roles del Sistema
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Tabla Intermedia Usuario - Rol (M:N)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Tabla de Clientes / Huéspedes
CREATE TABLE guests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    document_type VARCHAR(20) NOT NULL DEFAULT 'CC', -- CC, CE, PASAPORTE, NIT
    document_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Tipos de Habitación
CREATE TABLE room_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    base_capacity INT NOT NULL DEFAULT 2,
    base_beds INT NOT NULL DEFAULT 1,
    base_price_per_night NUMERIC(12, 2) NOT NULL, -- En COP
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Habitaciones Físicas
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    description TEXT,
    capacity INT NOT NULL,
    bed_count INT NOT NULL,
    price_per_night NUMERIC(12, 2) NOT NULL, -- En COP
    operational_status VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE', -- DISPONIBLE, OCUPADA, LIMPIEZA, MANTENIMIENTO, FUERA_DE_SERVICIO
    floor VARCHAR(20) DEFAULT '1',
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Comodidades (Amenities)
CREATE TABLE amenities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. Tabla Intermedia Habitación - Comodidades
CREATE TABLE room_amenities (
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, amenity_id)
);

-- 9. Tabla de Reservas
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    guest_id BIGINT NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INT NOT NULL,
    price_per_night NUMERIC(12, 2) NOT NULL,
    number_of_nights INT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- IVA 19%
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, CONFIRMADA, CHECKED_IN, CHECKED_OUT, CANCELADA, NO_SHOW
    cancellation_reason TEXT,
    actual_check_in TIMESTAMP WITHOUT TIME ZONE,
    actual_check_out TIMESTAMP WITHOUT TIME ZONE,
    created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    version INT NOT NULL DEFAULT 0, -- Optimistic Locking
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

-- 10. Tabla de Servicios Adicionales del Hotel
CREATE TABLE hotel_services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- FOOD, LAUNDRY, PARKING, TOUR, TRANSPORT
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 11. Tabla de Servicios Adicionales por Reserva
CREATE TABLE booking_services (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES hotel_services(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    added_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabla de Pagos
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'COP',
    method VARCHAR(30) NOT NULL, -- TARJETA, PSE, NEQUI, BANCOLOMBIA, EFECTIVO
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, DECLINED, REFUNDED, ERROR
    provider VARCHAR(50) NOT NULL DEFAULT 'SIMULATED', -- SIMULATED, WOMPI, MERCADOPAGO
    provider_transaction_id VARCHAR(150),
    provider_response TEXT,
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tabla de Facturas Electrónicas
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL,
    guest_id BIGINT NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED', -- DRAFT, ISSUED, SENT_TO_DIAN, APPROVED, REJECTED, CANCELLED
    cufe VARCHAR(255),
    document_url TEXT,
    provider_response TEXT,
    issued_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- ÍNDICES ESTRATÉGICOS PARA MÁXIMO RENDIMIENTO
-- ==========================================================

-- Búsqueda de disponibilidad ultra rápida (anti-solapamiento)
CREATE INDEX idx_bookings_availability ON bookings (room_id, status, check_in_date, check_out_date);

-- Búsqueda de reservas por huésped y código
CREATE INDEX idx_bookings_guest ON bookings (guest_id);
CREATE INDEX idx_bookings_status ON bookings (status);

-- Búsqueda de habitaciones activas y por estado operativo
CREATE INDEX idx_rooms_lookup ON rooms (room_type_id, operational_status, active);

-- Búsqueda de usuarios y clientes
CREATE INDEX idx_guests_document ON guests (document_type, document_number);
CREATE INDEX idx_guests_email ON guests (email);

-- Búsqueda de pagos
CREATE INDEX idx_payments_booking ON payments (booking_id);
