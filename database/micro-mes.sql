-- aqui activamos la extension para generar UUIDs automaticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- aqui creo la tabla de usuarios supervisores de planta
CREATE TABLE IF NOT EXISTS supervisores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- y aqui se creo la tabla principal de lineas de produccion
CREATE TABLE IF NOT EXISTS lineas_produccion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_linea VARCHAR(150) NOT NULL,
    capacidad_teorica NUMERIC(10,2) NOT NULL,
    tiempo_planificado NUMERIC(10,2) NOT NULL,
    tiempo_paradas NUMERIC(10,2) NOT NULL DEFAULT 0,
    unidades_producidas INTEGER NOT NULL DEFAULT 0,
    unidades_defectuosas INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'Activa'
        CHECK (estado IN ('Activa', 'Inactiva', 'En Mantenimiento')),
    usuario_creador UUID NOT NULL REFERENCES supervisores(id),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Usuario de prueba para evaluacion
-- Email: evaluador@sincron.com
-- Password: Sincron2026
-- ============================================
INSERT INTO supervisores (nombre, email, password_hash)
SELECT 'Supervisor de Prueba', 'evaluador@sincron.com', '$2b$12$PCzJMijbI2WvJnfulM5BleLYyAz/iZp77OTFBfR82z7wtJlBnNKQO'
WHERE NOT EXISTS (
    SELECT 1 FROM supervisores WHERE email = 'evaluador@sincron.com'
);