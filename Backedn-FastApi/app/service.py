from sqlalchemy.orm import Session
from .repository import UsuarioRepository
from . import models, schemas

class UsuarioService:
    def __init__(self, db: Session):
        self.repo = UsuarioRepository(db)

    def get_all(self):
        return self.repo.find_all()

    def get_by_id(self, usuario_id: int):
        return self.repo.find_by_id(usuario_id)

    def create(self, usuario_data: schemas.UsuarioCreate):
        usuario = models.Usuario(**usuario_data.model_dump())
        return self.repo.save(usuario)

    def update(self, usuario_id: int, usuario_data: schemas.UsuarioUpdate):
        db_usuario = self.repo.find_by_id(usuario_id)
        if not db_usuario:
            return None

        update_data = usuario_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_usuario, key, value)

        return self.repo.save(db_usuario)

    def delete(self, usuario_id: int):
        db_usuario = self.repo.find_by_id(usuario_id)
        if db_usuario:
            self.repo.delete(db_usuario)
            return True
        return False
