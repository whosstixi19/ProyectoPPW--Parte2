from sqlalchemy import Column, BigInteger, String, DateTime, Text
from datetime import datetime
from .database import Base

# Modelo para Asesoría
class Asesoria(Base):
    __tablename__ = "asesorias"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    usuario_uid = Column(String(255), nullable=False)
    usuario_nombre = Column(String(255), nullable=False)
    usuario_email = Column(String(255), nullable=False)
    programador_uid = Column(String(255), nullable=False)
    programador_nombre = Column(String(255), nullable=False)
    tema = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=False)
    comentario = Column(Text, nullable=True)
    fecha_solicitada = Column(String(20), nullable=False)  # YYYY-MM-DD
    hora_solicitada = Column(String(10), nullable=False)   # HH:mm
    estado = Column(String(50), default="pendiente", nullable=False)  # pendiente, aprobada, rechazada
    respuesta = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_respuesta = Column(DateTime, nullable=True)

# Modelo para Ausencia
class Ausencia(Base):
    __tablename__ = "ausencias"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    programador_uid = Column(String(255), nullable=False, index=True)
    fecha = Column(String(20), nullable=False)  # YYYY-MM-DD
    hora_inicio = Column(String(10), nullable=False)  # HH:mm
    hora_fin = Column(String(10), nullable=False)     # HH:mm
    motivo = Column(Text, nullable=True)
