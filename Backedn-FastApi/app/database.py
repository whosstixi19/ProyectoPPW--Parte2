from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cadena de conexión a PostgreSQL
# formato: postgresql://usuario:password@host:puerto/base_de_datos
SQLALCHEMY_DATABASE_URL = (
    "postgresql://proyectoportafolio_usr:root@localhost:5432/ProyectoPortafolios_bd"
)

# Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True 
)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para los modelos
Base = declarative_base()

# Dependency para FastAPI (abre y cierra la sesión)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
