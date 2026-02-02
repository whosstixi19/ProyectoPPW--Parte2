from sqlalchemy.orm import Session
from . import models

class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(models.Usuario).all()

    def find_by_id(self, usuario_id: int):
        return self.db.query(models.Usuario).filter(
            models.Usuario.id == usuario_id
        ).first()

    def find_by_mail(self, mail: str):
        return self.db.query(models.Usuario).filter(
            models.Usuario.mail == mail
        ).first()

    def save(self, usuario: models.Usuario):
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def delete(self, usuario: models.Usuario):
        self.db.delete(usuario)
        self.db.commit()
