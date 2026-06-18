#Importa BaseModel para crear esquemas de validacion de datos
#EmailStr permite validar que los correos tengan un formato correcto
from pydantic import BaseModel, EmailStr
#Optional permite definir campos opcionales
from typing import Optional

#La clase para el registro de supervisores
class SupervisorRegistro(BaseModel):
    nombre: str
    email: EmailStr
    password: str
#L clase para el inicio de sesion
class SupervisorLogin(BaseModel):
    email: EmailStr
    password: str
#La clase para crear una nueva linea de produccion
class LineaCreate(BaseModel):
    nombre_linea: str
    capacidad_teorica: float
    tiempo_planeacion: float
    tiempo_paradas: float = 0
    unidades_producidas: int = 0
    unidades_defectuosas: int = 0
    estado: str = "Activa"
#La clase para actualizar una linea de produccion
class LineaUpdate(BaseModel):
    nombre_linea: Optional[str] = None
    capacidad_teorica: Optional[float] = None
    tiempo_planificado: Optional[float] = None
    tiempo_paradas: Optional[float] = None
    unidades_producidas: Optional[int] = None
    unidades_defectuosas: Optional[int] = None
    estado: Optional[str] = None