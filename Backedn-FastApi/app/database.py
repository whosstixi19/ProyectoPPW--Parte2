from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Cadena de conexión a PostgreSQL
# formato: postgresql://usuario:password@host:puerto/base_de_datos
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin@localhost:5432/proyecto_ppw"
)

print(f"🔌 Conectando a PostgreSQL: {SQLALCHEMY_DATABASE_URL.split('@')[1]}")

# Engine con configuración optimizada
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=True  # Mostrar SQL queries
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para los modelos (Asesoria, Ausencia)
Base = declarative_base()

# Dependency para FastAPI (abre y cierra la sesión)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
