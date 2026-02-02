from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from . import models, schemas, database, service
from .auth import verify_firebase_token

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Usuarios API - FastAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_usuario_service(db: Session = Depends(database.get_db)):
    return service.UsuarioService(db)

# protege TODAS las rutas (dependencia global)
@app.get("/api/usuarios", response_model=List[schemas.UsuarioOut],
         dependencies=[Depends(verify_firebase_token)])
def read_usuarios(service: service.UsuarioService = Depends(get_usuario_service)):
    return service.get_all()

@app.get("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioOut,
         dependencies=[Depends(verify_firebase_token)])
def read_usuario(usuario_id: int, service: service.UsuarioService = Depends(get_usuario_service)):
    usuario = service.get_by_id(usuario_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@app.post("/api/usuarios", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED,
          dependencies=[Depends(verify_firebase_token)])
def create_usuario(usuario: schemas.UsuarioCreate, service: service.UsuarioService = Depends(get_usuario_service)):
    return service.create(usuario)

@app.put("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioOut,
         dependencies=[Depends(verify_firebase_token)])
def update_usuario(usuario_id: int, usuario: schemas.UsuarioUpdate, service: service.UsuarioService = Depends(get_usuario_service)):
    db_usuario = service.update(usuario_id, usuario)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario

@app.delete("/api/usuarios/{usuario_id}",
            dependencies=[Depends(verify_firebase_token)])
def delete_usuario(usuario_id: int, service: service.UsuarioService = Depends(get_usuario_service)):
    if not service.delete(usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado correctamente"}
