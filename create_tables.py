"""
Script para crear las tablas en PostgreSQL
Ejecuta este script ANTES de la migración si las tablas no existen
"""
import psycopg2

# Configuración de PostgreSQL
PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',
    'user': 'Proyecto_PPW',
    'password': 'root'
}

# SQL para crear las tablas
CREATE_TABLES_SQL = """
-- Tabla persona (usuarios)
CREATE TABLE IF NOT EXISTS persona (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    display_name VARCHAR(255),
    photo_url TEXT
);

-- Tabla programadores
CREATE TABLE IF NOT EXISTS programadores (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla horarios_disponibles
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id BIGSERIAL PRIMARY KEY,
    programador_uid VARCHAR(255) NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(programador_uid, dia_semana, hora_inicio, hora_fin)
);

-- Tabla asesorias
CREATE TABLE IF NOT EXISTS asesorias (
    id BIGSERIAL PRIMARY KEY,
    usuario_uid VARCHAR(255) NOT NULL,
    usuario_nombre VARCHAR(255) NOT NULL,
    usuario_email VARCHAR(255) NOT NULL,
    programador_uid VARCHAR(255) NOT NULL,
    programador_nombre VARCHAR(255) NOT NULL,
    tema VARCHAR(500) NOT NULL,
    descripcion TEXT NOT NULL,
    comentario TEXT,
    fecha_solicitada VARCHAR(20) NOT NULL,
    hora_solicitada VARCHAR(10) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL,
    respuesta TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_respuesta TIMESTAMP
);

-- Tabla ausencias
CREATE TABLE IF NOT EXISTS ausencias (
    id BIGSERIAL PRIMARY KEY,
    programador_uid VARCHAR(255) NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    motivo TEXT
);

-- Tabla proyectos (opcional)
CREATE TABLE IF NOT EXISTS proyectos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tecnologias JSONB,
    estado VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_persona_uid ON persona(uid);
CREATE INDEX IF NOT EXISTS idx_persona_email ON persona(email);
CREATE INDEX IF NOT EXISTS idx_programadores_uid ON programadores(uid);
CREATE INDEX IF NOT EXISTS idx_horarios_programador ON horarios_disponibles(programador_uid);
CREATE INDEX IF NOT EXISTS idx_asesorias_usuario ON asesorias(usuario_uid);
CREATE INDEX IF NOT EXISTS idx_asesorias_programador ON asesorias(programador_uid);
CREATE INDEX IF NOT EXISTS idx_asesorias_estado ON asesorias(estado);
CREATE INDEX IF NOT EXISTS idx_ausencias_programador ON ausencias(programador_uid);
CREATE INDEX IF NOT EXISTS idx_ausencias_fecha ON ausencias(fecha);
"""

def create_tables():
    """Crea todas las tablas necesarias en PostgreSQL"""
    try:
        print("🐘 Conectando a PostgreSQL...")
        conn = psycopg2.connect(**PG_CONFIG)
        cursor = conn.cursor()
        
        print("📋 Creando tablas...")
        cursor.execute(CREATE_TABLES_SQL)
        conn.commit()
        
        print("✅ Tablas creadas exitosamente!")
        
        # Verificar tablas creadas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tablas = cursor.fetchall()
        print("\n📊 Tablas en la base de datos:")
        for tabla in tablas:
            print(f"  ✓ {tabla[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🗄️  CREANDO TABLAS EN POSTGRESQL")
    print("=" * 60)
    create_tables()
    print("=" * 60)
