from sqlalchemy import Column, BigInteger, String
from .database import Base

class Usuario(Base):
    __tablename__ = "tbl_usuario"
    id = Column("usu_id", BigInteger, primary_key=True, index=True)
    nombre = Column("usu_nombre", String(255), nullable=False)
    mail = Column("usu_mail", String(255), nullable=False)
    rol = Column("usu_rol", String(255), nullable=False)
    prog_id = Column("usu_progid", BigInteger, nullable=True)
    foto_url = Column("usu_fotourl", String(255), nullable=True)
