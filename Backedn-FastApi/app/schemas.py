from pydantic import BaseModel
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    mail: str = Field(..., alias="email")                 # acepta "email"
    rol: str
    prog_id: Optional[int] = Field(None, alias="programadorId") # acepta "programadorId"
    foto_url: Optional[str] = Field(None, alias="fotoUrl")      # acepta "fotoUrl"

    model_config = ConfigDict(
        populate_by_name=True,  # permite enviar mail o email, prog_id o programadorId...
        from_attributes=True
    )

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    mail: Optional[str] = Field(None, alias="email")
    rol: Optional[str] = None
    prog_id: Optional[int] = Field(None, alias="programadorId")
    foto_url: Optional[str] = Field(None, alias="fotoUrl")

    model_config = ConfigDict(populate_by_name=True)

class UsuarioOut(BaseModel):
    id: int
    nombre: str
    mail: str
    rol: str
    prog_id: Optional[int] = None
    foto_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

