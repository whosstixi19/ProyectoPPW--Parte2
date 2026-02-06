from sqlalchemy.orm import Session
from . import models


class AsesoriaRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(models.Asesoria).all()

    def find_by_id(self, asesoria_id: int):
        return self.db.query(models.Asesoria).filter(
            models.Asesoria.id == asesoria_id
        ).first()

    def find_by_usuario(self, usuario_uid: str):
        return self.db.query(models.Asesoria).filter(
            models.Asesoria.usuario_uid == usuario_uid
        ).all()

    def find_by_programador(self, programador_uid: str):
        return self.db.query(models.Asesoria).filter(
            models.Asesoria.programador_uid == programador_uid
        ).all()

    def save(self, asesoria: models.Asesoria):
        self.db.add(asesoria)
        self.db.commit()
        self.db.refresh(asesoria)
        return asesoria

    def delete(self, asesoria: models.Asesoria):
        self.db.delete(asesoria)
        self.db.commit()


class AusenciaRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(models.Ausencia).all()

    def find_by_id(self, ausencia_id: int):
        return self.db.query(models.Ausencia).filter(
            models.Ausencia.id == ausencia_id
        ).first()

    def find_by_programador(self, programador_uid: str):
        return self.db.query(models.Ausencia).filter(
            models.Ausencia.programador_uid == programador_uid
        ).all()

    def save(self, ausencia: models.Ausencia):
        self.db.add(ausencia)
        self.db.commit()
        self.db.refresh(ausencia)
        return ausencia

    def delete(self, ausencia: models.Ausencia):
        self.db.delete(ausencia)
        self.db.commit()
