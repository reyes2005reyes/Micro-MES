# Micro-MES — Sistema de Monitoreo de Eficiencia en Planta

Desarrollado por: johan sebastian reyes montoya
Empresa: Sincrón Diseño Electrónico S.A.S.
Stack: FastAPI + React + PostgreSQL

## Requisitos previos

- Python 3.12+
- Node.js 20+
- PostgreSQL 9.2+
- npm 10+


## 1. se creo la base de datos (PostgreSQL)

1. Abre pgAdmin y crea una base de datos llamada `micro-mes`
2. Abre el Query Editor sobre esa base de datos
3. Ejecuta primero: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; esto es para activar la extension para generar UUIDs automaticos
4. Luego ejecuta el archivo que esta en la carpeta database `database/micro-mes.sql`



## 2. Backend (FastAPI)

1. Entra a la carpeta backend con el comando: cd backend
2. Aqui creamos y activamos el entorno virtual con el comando: py -m venv venv y luego venv\Scripts\activate
    con ese comando se crearan varias carpetas para poder usar el entorno virtual
3. Instala las dependencias con el comado: py -m pip install fastapi uvicorn psycopg2-binary pyjwt passlib[bcrypt] python-dotenv
   O directamente desde el archivo de requisitos:
   py -m pip install -r requirements.txt
4. Configura el archivo `.env` dentro de `backend` con tus datos de conexion:
5. Corre el servidor:
   uvicorn main:app --reload --port 8000
6. Verifica que funciona abriendo: http://localhost:8000/docs



## 3. Frontend (React)

1. Entra a la carpeta frontend:
   cd frontend

2. Instala las dependencias:
   npm install

3. Corre el servidor de desarrollo:
   npm run dev
4. Abre en el navegador: http://localhost:5173

## 4. Gestion de conexiones a la base de datos

Se utiliza `psycopg2` con una función generadora (`yield`) en `database.py`. Cada endpoint de FastAPI recibe la conexión mediante `Depends(get_db)`, y al finalizar la peticion la conexión se cierra automáticamente, evitando saturación del servidor PostgreSQL.
