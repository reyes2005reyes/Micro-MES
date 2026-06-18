#Libreria para conectarse a PostgreSQL
import psycopg2

#Permite cargar variables de entorno desde un archivo .env
from dotenv import load_dotenv 

#Libreria para acceder a variables de entorno del sistema
import os 

#Carga las variables definidas en el archivo .env
load_dotenv()

def get_connection():
    #Establece la conexion con PostgreSQL
    connection = psycopg2.connect(
        host = os.getenv("DB_HOST"),
        port = os.getenv("DB_PORT"),
        dbname = os.getenv("DB_NAME"),
        user = os.getenv("DB_USER"),
        password = os.getenv("DB_PASSWORD")
    )
    return connection

    
    #Generador que administra automaticamente la conexion a la base de datos.
    #Abre una conexion, la entrega al endpoint mediante 'yield' y al finalizar la peticion, garantiza su cierre para evitar conexiones abiertas innecesarias.
    
def get_db():
    conn = get_connection()
    try:
        yield conn
    finally: 
        conn.close()

