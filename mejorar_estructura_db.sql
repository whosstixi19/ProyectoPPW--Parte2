-- ============================================================================
-- SCRIPT DE MEJORA DE ESTRUCTURA DE BASE DE DATOS
-- Para uso con FastAPI, Spring Boot y Jakarta/Wildfly
-- ============================================================================

-- 1. MEJORAR TABLA programadores
-- Agregar campos faltantes y mejorar tipos de datos
ALTER TABLE programadores
    ALTER COLUMN uid SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN display_name SET NOT NULL,
    ALTER COLUMN enabled SET DEFAULT true,
    ALTER COLUMN role SET DEFAULT 'PROGRAMADOR';

-- Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_programadores_email ON programadores(email);
CREATE INDEX IF NOT EXISTS idx_programadores_enabled ON programadores(enabled);

-- 2. MEJORAR TABLA horarios_disponibles
-- Agregar constraint y mejorar estructura
ALTER TABLE horarios_disponibles
    ALTER COLUMN programador_uid SET NOT NULL,
    ALTER COLUMN dia SET NOT NULL,
    ALTER COLUMN hora_inicio SET NOT NULL,
    ALTER COLUMN hora_fin SET NOT NULL,
    ALTER COLUMN activo SET DEFAULT true;

-- Agregar secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS horarios_disponibles_id_seq;
ALTER TABLE horarios_disponibles 
    ALTER COLUMN id SET DEFAULT nextval('horarios_disponibles_id_seq');

-- Agregar constraint único
ALTER TABLE horarios_disponibles
    DROP CONSTRAINT IF EXISTS uk_horario_programador,
    ADD CONSTRAINT uk_horario_programador 
    UNIQUE (programador_uid, dia, hora_inicio, hora_fin);

-- Índices
CREATE INDEX IF NOT EXISTS idx_horarios_programador ON horarios_disponibles(programador_uid);
CREATE INDEX IF NOT EXISTS idx_horarios_activo ON horarios_disponibles(activo);

-- 3. MEJORAR TABLA asesorias
-- Agregar defaults y constraints
ALTER TABLE asesorias
    ALTER COLUMN estado SET DEFAULT 'pendiente',
    ALTER COLUMN fecha_creacion SET DEFAULT NOW();

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_asesorias_usuario_uid ON asesorias(usuario_uid);
CREATE INDEX IF NOT EXISTS idx_asesorias_programador_uid ON asesorias(programador_uid);
CREATE INDEX IF NOT EXISTS idx_asesorias_estado ON asesorias(estado);
CREATE INDEX IF NOT EXISTS idx_asesorias_fecha_solicitada ON asesorias(fecha_solicitada);

-- 4. MEJORAR TABLA ausencias
-- Índices
CREATE INDEX IF NOT EXISTS idx_ausencias_programador_uid ON ausencias(programador_uid);
CREATE INDEX IF NOT EXISTS idx_ausencias_fecha ON ausencias(fecha);

-- 5. MEJORAR TABLA proyectos
-- Cambiar id a tipo consistente y agregar índices
CREATE INDEX IF NOT EXISTS idx_proyectos_programador_uid ON proyectos(programador_uid);
CREATE INDEX IF NOT EXISTS idx_proyectos_tipo ON proyectos(tipo);

-- 6. CREAR TABLA usuarios (para usuarios normales, no programadores)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    role VARCHAR(50) DEFAULT 'usuario' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usuarios_uid ON usuarios(uid);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- 7. AGREGAR FOREIGN KEYS para integridad referencial
-- (Opcional, descomenta si quieres forzar integridad referencial)

-- ALTER TABLE horarios_disponibles
--     ADD CONSTRAINT fk_horarios_programador
--     FOREIGN KEY (programador_uid) REFERENCES programadores(uid)
--     ON DELETE CASCADE;

-- ALTER TABLE ausencias
--     ADD CONSTRAINT fk_ausencias_programador
--     FOREIGN KEY (programador_uid) REFERENCES programadores(uid)
--     ON DELETE CASCADE;

-- ALTER TABLE proyectos
--     ADD CONSTRAINT fk_proyectos_programador
--     FOREIGN KEY (programador_uid) REFERENCES programadores(uid)
--     ON DELETE CASCADE;

-- 8. CREAR VISTAS ÚTILES
-- Vista de programadores con conteo de horarios
CREATE OR REPLACE VIEW v_programadores_info AS
SELECT 
    p.*,
    COUNT(DISTINCT h.id) as total_horarios,
    COUNT(DISTINCT a.id) as total_ausencias,
    COUNT(DISTINCT pr.id) as total_proyectos
FROM programadores p
LEFT JOIN horarios_disponibles h ON p.uid = h.programador_uid
LEFT JOIN ausencias a ON p.uid = a.programador_uid
LEFT JOIN proyectos pr ON p.uid = pr.programador_uid
GROUP BY p.uid;

-- Vista de asesorías con información completa
CREATE OR REPLACE VIEW v_asesorias_completas AS
SELECT 
    a.*,
    p.email as programador_email,
    p.especialidad as programador_especialidad,
    p.photo_url as programador_photo
FROM asesorias a
LEFT JOIN programadores p ON a.programador_uid = p.uid;

-- 9. AGREGAR COMENTARIOS A LAS TABLAS
COMMENT ON TABLE programadores IS 'Tabla de programadores/tutores del sistema';
COMMENT ON TABLE horarios_disponibles IS 'Horarios disponibles de cada programador';
COMMENT ON TABLE asesorias IS 'Solicitudes de asesoría entre usuarios y programadores';
COMMENT ON TABLE ausencias IS 'Registro de ausencias de programadores';
COMMENT ON TABLE proyectos IS 'Proyectos de portafolio de los programadores';
COMMENT ON TABLE usuarios IS 'Usuarios normales del sistema (no programadores)';

-- 10. VERIFICACIÓN FINAL
SELECT 
    'programadores' as tabla, COUNT(*) as registros FROM programadores
UNION ALL
SELECT 'horarios_disponibles', COUNT(*) FROM horarios_disponibles
UNION ALL
SELECT 'asesorias', COUNT(*) FROM asesorias
UNION ALL
SELECT 'ausencias', COUNT(*) FROM ausencias
UNION ALL
SELECT 'proyectos', COUNT(*) FROM proyectos
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios;

-- ============================================================================
-- SCRIPT COMPLETADO
-- ============================================================================
