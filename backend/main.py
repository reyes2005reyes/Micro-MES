#Importa FastAPI para crear la API y las dependencias necesarias
from fastapi import FastAPI, Depends, HTTPException, status
#Middleware para permitir solicitudes desde otros dominios
from fastapi.middleware.cors import CORSMiddleware
#Funcion que proporciona la conexion a la base de datos
from database import get_db
#Funciones relacionadas con autenticación y manejo de JWT
from auth import hash_password, verify_password, create_token, get_current_user
from models import SupervisorRegistro, SupervisorLogin, LineaCreate, LineaUpdate
from dotenv import load_dotenv
#Carga las variables de entorno configuradas en el archivo .env
load_dotenv()
#Creacion de la aplicacion FastAPI
app = FastAPI(title = "Mocro-Mes API", version = "1.0.0")

#Configuración de CORS
#Permite que aplicaciones externas (Frontend)
#puedan consumir esta API.
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"]
)