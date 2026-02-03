from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas

# ========== Servicio para Asesorías ==========

class AsesoriaService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(models.Asesoria).all()

    def get_by_id(self, asesoria_id: int):
        return self.db.query(models.Asesoria).filter(models.Asesoria.id == asesoria_id).first()

    def get_by_usuario(self, usuario_uid: str):
        return self.db.query(models.Asesoria).filter(models.Asesoria.usuario_uid == usuario_uid).all()

    def get_by_programador(self, programador_uid: str):
        return self.db.query(models.Asesoria).filter(models.Asesoria.programador_uid == programador_uid).all()

    def get_pendientes_by_programador(self, programador_uid: str):
        return self.db.query(models.Asesoria).filter(
            models.Asesoria.programador_uid == programador_uid,
            models.Asesoria.estado == "pendiente"
        ).all()

    def create(self, asesoria_data: schemas.AsesoriaCreate):
        asesoria = models.Asesoria(**asesoria_data.model_dump())
        self.db.add(asesoria)
        self.db.commit()
        self.db.refresh(asesoria)
        return asesoria

    def update(self, asesoria_id: int, asesoria_data: schemas.AsesoriaUpdate):
        asesoria = self.get_by_id(asesoria_id)
        if not asesoria:
            return None

        update_data = asesoria_data.model_dump(exclude_unset=True)
        
        # Si se actualiza el estado, registrar la fecha de respuesta
        if 'estado' in update_data and update_data['estado'] in ['aprobada', 'rechazada']:
            update_data['fecha_respuesta'] = datetime.utcnow()
        
        for key, value in update_data.items():
            setattr(asesoria, key, value)

        self.db.commit()
        self.db.refresh(asesoria)
        return asesoria

    def delete(self, asesoria_id: int):
        asesoria = self.get_by_id(asesoria_id)
        if asesoria:
            self.db.delete(asesoria)
            self.db.commit()
            return True
        return False

# ========== Servicio para Ausencias ==========

class AusenciaService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(models.Ausencia).all()

    def get_by_id(self, ausencia_id: int):
        return self.db.query(models.Ausencia).filter(models.Ausencia.id == ausencia_id).first()

    def get_by_programador(self, programador_uid: str):
        return self.db.query(models.Ausencia).filter(models.Ausencia.programador_uid == programador_uid).all()

    def get_by_programador_y_fecha(self, programador_uid: str, fecha: str):
        return self.db.query(models.Ausencia).filter(
            models.Ausencia.programador_uid == programador_uid,
            models.Ausencia.fecha == fecha
        ).all()

    def create(self, ausencia_data: schemas.AusenciaCreate):
        ausencia = models.Ausencia(**ausencia_data.model_dump())
        self.db.add(ausencia)
        self.db.commit()
        self.db.refresh(ausencia)
        return ausencia

    def update(self, ausencia_id: int, ausencia_data: schemas.AusenciaUpdate):
        ausencia = self.get_by_id(ausencia_id)
        if not ausencia:
            return None

        update_data = ausencia_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(ausencia, key, value)

        self.db.commit()
        self.db.refresh(ausencia)
        return ausencia

    def delete(self, ausencia_id: int):
        ausencia = self.get_by_id(ausencia_id)
        if ausencia:
            self.db.delete(ausencia)
            self.db.commit()
            return True
        return False
