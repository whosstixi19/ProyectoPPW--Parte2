from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

# ========== Schemas para Asesoría ==========

class AsesoriaBase(BaseModel):
    usuario_uid: str
    usuario_nombre: str
    usuario_email: str
    programador_uid: str
    programador_nombre: str
    tema: str
    descripcion: str
    comentario: Optional[str] = None
    fecha_solicitada: str  # YYYY-MM-DD
    hora_solicitada: str   # HH:mm
    estado: str = "pendiente"
    respuesta: Optional[str] = None

class AsesoriaCreate(AsesoriaBase):
    pass

class AsesoriaUpdate(BaseModel):
    tema: Optional[str] = None
    descripcion: Optional[str] = None
    comentario: Optional[str] = None
    fecha_solicitada: Optional[str] = None
    hora_solicitada: Optional[str] = None
    estado: Optional[str] = None
    respuesta: Optional[str] = None

class AsesoriaOut(AsesoriaBase):
    id: int
    fecha_creacion: datetime
    fecha_respuesta: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# ========== Schemas para Ausencia ==========

class AusenciaBase(BaseModel):
    programador_uid: str
    fecha: str          # YYYY-MM-DD
    hora_inicio: str    # HH:mm
    hora_fin: str       # HH:mm
    motivo: Optional[str] = None

class AusenciaCreate(AusenciaBase):
    pass

class AusenciaUpdate(BaseModel):
    fecha: Optional[str] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    motivo: Optional[str] = None

class AusenciaOut(AusenciaBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

