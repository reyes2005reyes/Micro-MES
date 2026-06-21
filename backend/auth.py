#Libreria para crear y validar tokens JWT
import jwt 
#Libreria para acceder a variables de entorno
import os 
#Manejo de fechas y tiempos de expiracion
from datetime import datetime, timedelta
#Dependencias de FastAPI para autenticacion y manejo de errores
from fastapi import Depends, HTTPException, status
#Esquema de autenticacion
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
#Libreria para cifrar y verificar contraseñas
from passlib.context import CryptContext


#Configuracion del contexto de cifrado usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#Configuracion del esquema de autenticacion Bearer
security = HTTPBearer()

def hash_password(password: str) -> str:
    #Genera un hash seguro de la contraseña utilizando bcrypt.
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    #Verifica si una contraseña en texto plano coincide con el hash almacenado en la base de datos.
    return pwd_context.verify(plain_password, hashed_password)

def create_token(data: dict) -> str:
    #se crea un token JWT con una expiracion de 8 horas.
    #Copia los datos recibido
    payload = data.copy()
    #Agrega la fecha de expiracion al token
    payload["exp"] = datetime.utcnow() + timedelta(hours=8)
    #Genera el token firmado con la clave secreta
    token = jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")
    return token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    #Valida el token enviado en la cabecera Authorization y retorna la información del usuario.
    try:
        #Obtiene el token enviado por el cliente
        token = credentials.credentials
        #valida el token
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Token invalido"
        )