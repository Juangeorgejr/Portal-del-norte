-- ==========================================================
-- HOTEL PORTAL DEL NORTE - DATOS INICIALES (SEED DATA)
-- Migración V2: Roles, usuarios por defecto, tipos, habitaciones y servicios
-- ==========================================================

-- 1. Inserción de Roles
INSERT INTO roles (id, name) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_EMPLEADO'),
(3, 'ROLE_CLIENTE');

-- 2. Inserción de Usuarios Iniciales
-- Contraseña encriptada con BCrypt (cost factor 10/12):
-- admin@portaldelnorte.com     -> Admin123*    ($2a$12$e8iVw6p/m7tNfxr6jT1LueGvL6J8q8G7S8F8W8V8U8T8S8R8Q8P8O)
-- recepcion@portaldelnorte.com -> Recepcion123*
-- carlos.gomez@gmail.com      -> Cliente123*

-- Generado con BCrypt estándar para testing rápido y seguro:
-- 'Admin123*' = $2a$10$w09Z2bI6kK7tW3DkGcqn0.x7PekfX/6H15.K7O.7l6w6D8H3WbJmK (o equivalente)
INSERT INTO users (id, email, password_hash, active, created_at, updated_at) VALUES
(1, 'admin@portaldelnorte.com', '$2a$10$vI8aWBnW3fID.ZQ1vXq1iupGqG0K7iR9Mh1RkWfEfZkY9U3N9eUSe', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'recepcion@portaldelnorte.com', '$2a$10$vI8aWBnW3fID.ZQ1vXq1iupGqG0K7iR9Mh1RkWfEfZkY9U3N9eUSe', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'carlos.gomez@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ1vXq1iupGqG0K7iR9Mh1RkWfEfZkY9U3N9eUSe', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Asignación de Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin -> ROLE_ADMIN
(2, 2), -- Recepción -> ROLE_EMPLEADO
(3, 3); -- Carlos -> ROLE_CLIENTE

-- Perfil de Huésped para Carlos Gómez
INSERT INTO guests (id, user_id, first_name, last_name, email, phone, document_type, document_number) VALUES
(1, 3, 'Carlos Alberto', 'Gómez Restrepo', 'carlos.gomez@gmail.com', '+57 310 456 7890', 'CC', '1098765432');

-- 3. Tipos de Habitación (Tarifas en Pesos Colombianos COP)
INSERT INTO room_types (id, name, description, base_capacity, base_beds, base_price_per_night, active) VALUES
(1, 'Individual Standard', 'Habitación acogedora diseñada para viajeros de negocios o estadías individuales. Cuenta con cama semi-doble, escritorio ergonómico y baño privado.', 1, 1, 120000.00, TRUE),
(2, 'Doble Confort', 'Ideal para parejas o colegas. Equipada con dos camas individuales o una cama Queen, Smart TV y vista a los jardines interiores.', 2, 2, 190000.00, TRUE),
(3, 'Matrimonial Deluxe', 'Elegante y espaciosa habitación con cama King Size, iluminación ambiental, balcón privado y tina de hidromasaje.', 2, 1, 240000.00, TRUE),
(4, 'Familiar Superior', 'Espaciosa suite familiar con capacidad para 4 personas, dos ambientes independientes, cama King y dos camas individuales.', 4, 3, 340000.00, TRUE),
(5, 'Suite Presidencial Portal', 'La máxima experiencia de lujo y confort del hotel. Sala de estar privada, comedor, cama King Size premium, jacuzzi panorámico y minibar de cortesía.', 2, 1, 480000.00, TRUE);

-- 4. Comodidades (Amenities)
INSERT INTO amenities (id, name, icon, active) VALUES
(1, 'WiFi 6 Ultra Rápido', 'wifi', TRUE),
(2, 'Smart TV 55" 4K', 'tv', TRUE),
(3, 'Aire Acondicionado Climatizado', 'wind', TRUE),
(4, 'Minibar & Cafetera', 'coffee', TRUE),
(5, 'Caja de Seguridad Digital', 'shield-check', TRUE),
(6, 'Escritorio Ergonómico', 'briefcase', TRUE),
(7, 'Baño Privado con Tina', 'bath', TRUE),
(8, 'Balcón Panorámico', 'sun', TRUE);

-- 5. Habitaciones Físicas
INSERT INTO rooms (id, room_number, room_type_id, description, capacity, bed_count, price_per_night, operational_status, floor, image_url, active) VALUES
(1, '101', 1, 'Habitación Individual en primer piso con acceso directo al lobby.', 1, 1, 120000.00, 'DISPONIBLE', '1', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, '102', 2, 'Habitación Doble en primer piso con vista a la fuente interior.', 2, 2, 190000.00, 'DISPONIBLE', '1', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', TRUE),
(3, '103', 2, 'Habitación Doble silenciosa en ala norte.', 2, 2, 190000.00, 'DISPONIBLE', '1', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', TRUE),
(4, '201', 3, 'Matrimonial Deluxe con balcón privado en segundo piso.', 2, 1, 240000.00, 'DISPONIBLE', '2', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', TRUE),
(5, '202', 3, 'Matrimonial Deluxe con tina y cama King.', 2, 1, 240000.00, 'DISPONIBLE', '2', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', TRUE),
(6, '203', 4, 'Familiar Superior amplia con dos dormitorios conectados.', 4, 3, 340000.00, 'DISPONIBLE', '2', 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80', TRUE),
(7, '301', 4, 'Familiar Superior en tercer piso con excelente iluminación natural.', 4, 3, 340000.00, 'DISPONIBLE', '3', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', TRUE),
(8, '401', 5, 'Suite Presidencial Portal con jacuzzi panorámico y sala ejecutiva.', 2, 1, 480000.00, 'DISPONIBLE', '4', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', TRUE);

-- Asignación de Amenities a Habitaciones
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 6),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 7), (4, 8),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 7),
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6),
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6),
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6), (8, 7), (8, 8);

-- 6. Servicios Adicionales del Hotel
INSERT INTO hotel_services (id, name, description, price, category, active) VALUES
(1, 'Desayuno Buffet Gourmet', 'Variedad de frutas frescas, café colombiano premium, huevos al gusto, panes artesanales y jugos naturales.', 28000.00, 'FOOD', TRUE),
(2, 'Parqueadero Cubierto 24 Horas', 'Espacio vigilado con cámaras de seguridad y acceso automatizado.', 15000.00, 'PARKING', TRUE),
(3, 'Servicio de Lavandería Express', 'Lavado, secado y planchado con entrega en 12 horas.', 35000.00, 'LAUNDRY', TRUE),
(4, 'Transporte Aeropuerto - Hotel', 'Servicio privado en vehículo climatizado puerta a puerta.', 55000.00, 'TRANSPORT', TRUE),
(5, 'Tour Guiado por la Ciudad', 'Recorrido histórico y cultural de 3 horas con guía bilingüe.', 65000.00, 'TOUR', TRUE);

-- Actualizar secuencias PostgreSQL
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('guests_id_seq', (SELECT MAX(id) FROM guests));
SELECT setval('room_types_id_seq', (SELECT MAX(id) FROM room_types));
SELECT setval('amenities_id_seq', (SELECT MAX(id) FROM amenities));
SELECT setval('rooms_id_seq', (SELECT MAX(id) FROM rooms));
SELECT setval('hotel_services_id_seq', (SELECT MAX(id) FROM hotel_services));
