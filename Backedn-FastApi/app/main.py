from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas, database, service
from .auth import verify_firebase_token
from .firebase_config import initialize_firebase

# Inicializar Firebase Admin SDK
initialize_firebase()

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Asesorías y Ausencias API - FastAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Endpoint Público ==========

@app.get("/health")
def health_check():
    """Endpoint de salud (sin autenticación)"""
    return {"status": "ok", "service": "FastAPI - Asesorías y Ausencias"}

# ========== Dependencias ==========

def get_asesoria_service(db: Session = Depends(database.get_db)):
    return service.AsesoriaService(db)

def get_ausencia_service(db: Session = Depends(database.get_db)):
    return service.AusenciaService(db)

# ========== Endpoints de Asesorías (Requieren Autenticación) ==========

@app.get("/api/asesorias", response_model=List[schemas.AsesoriaOut])
def get_asesorias(
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Obtener todas las asesorías"""
    return asesoria_service.get_all()

@app.get("/api/asesorias/{asesoria_id}", response_model=schemas.AsesoriaOut)
def get_asesoria(
    asesoria_id: int,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Obtener una asesoría por ID"""
    asesoria = asesoria_service.get_by_id(asesoria_id)
    if not asesoria:
        raise HTTPException(status_code=404, detail="Asesoría no encontrada")
    return asesoria

@app.get("/api/asesorias/usuario/{usuario_uid}", response_model=List[schemas.AsesoriaOut])
def get_asesorias_usuario(
    usuario_uid: str,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Obtener todas las asesorías de un usuario"""
    return asesoria_service.get_by_usuario(usuario_uid)

@app.get("/api/asesorias/programador/{programador_uid}", response_model=List[schemas.AsesoriaOut])
def get_asesorias_programador(
    programador_uid: str,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Obtener todas las asesorías de un programador"""
    return asesoria_service.get_by_programador(programador_uid)

@app.get("/api/asesorias/programador/{programador_uid}/pendientes", response_model=List[schemas.AsesoriaOut])
def get_asesorias_pendientes(
    programador_uid: str,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Obtener asesorías pendientes de un programador"""
    return asesoria_service.get_pendientes_by_programador(programador_uid)

@app.post("/api/asesorias", response_model=schemas.AsesoriaOut, status_code=status.HTTP_201_CREATED)
def create_asesoria(
    asesoria: schemas.AsesoriaCreate,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Crear una nueva asesoría"""
    return asesoria_service.create(asesoria)

@app.put("/api/asesorias/{asesoria_id}", response_model=schemas.AsesoriaOut)
def update_asesoria(
    asesoria_id: int,
    asesoria: schemas.AsesoriaUpdate,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Actualizar una asesoría"""
    updated = asesoria_service.update(asesoria_id, asesoria)
    if not updated:
        raise HTTPException(status_code=404, detail="Asesoría no encontrada")
    return updated

@app.delete("/api/asesorias/{asesoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asesoria(
    asesoria_id: int,
    asesoria_service: service.AsesoriaService = Depends(get_asesoria_service)
):
    """Eliminar una asesoría"""
    if not asesoria_service.delete(asesoria_id):
        raise HTTPException(status_code=404, detail="Asesoría no encontrada")
    return None

# ========== Endpoints de Ausencias (Requieren Autenticación) ==========

@app.get("/api/ausencias", response_model=List[schemas.AusenciaOut])
def get_ausencias(
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Obtener todas las ausencias"""
    return ausencia_service.get_all()

@app.get("/api/ausencias/{ausencia_id}", response_model=schemas.AusenciaOut)
def get_ausencia(
    ausencia_id: int,
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Obtener una ausencia por ID"""
    ausencia = ausencia_service.get_by_id(ausencia_id)
    if not ausencia:
        raise HTTPException(status_code=404, detail="Ausencia no encontrada")
    return ausencia

@app.get("/api/ausencias/programador/{programador_uid}", response_model=List[schemas.AusenciaOut])
def get_ausencias_programador(
    programador_uid: str,
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Obtener todas las ausencias de un programador"""
    return ausencia_service.get_by_programador(programador_uid)

@app.get("/api/ausencias/programador/{programador_uid}/fecha/{fecha}", response_model=List[schemas.AusenciaOut])
def get_ausencias_por_fecha(
    programador_uid: str,
    fecha: str,
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Obtener ausencias de un programador en una fecha específica"""
    return ausencia_service.get_by_programador_y_fecha(programador_uid, fecha)

@app.post("/api/ausencias", response_model=schemas.AusenciaOut, status_code=status.HTTP_201_CREATED)
def create_ausencia(
    ausencia: schemas.AusenciaCreate,
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Crear una nueva ausencia"""
    return ausencia_service.create(ausencia)

@app.put("/api/ausencias/{ausencia_id}", response_model=schemas.AusenciaOut)
def update_ausencia(
    ausencia_id: int,
    ausencia: schemas.AusenciaUpdate,
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Actualizar una ausencia"""
    updated = ausencia_service.update(ausencia_id, ausencia)
    if not updated:
        raise HTTPException(status_code=404, detail="Ausencia no encontrada")
    return updated

@app.delete("/api/ausencias/{ausencia_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ausencia(
    ausencia_id: int,
    ausencia_service: service.AusenciaService = Depends(get_ausencia_service)
):
    """Eliminar una ausencia"""
    if not ausencia_service.delete(ausencia_id):
        raise HTTPException(status_code=404, detail="Ausencia no encontrada")
    return None
