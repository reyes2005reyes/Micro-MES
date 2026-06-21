# Importa FastAPI para crear la API y las dependencias necesarias
from fastapi import FastAPI, Depends, HTTPException, status
# Middleware para permitir solicitudes desde otros dominios
from fastapi.middleware.cors import CORSMiddleware
# Funcion que proporciona la conexion a la base de datos
from database import get_db
# Funciones relacionadas con autenticacion y manejo de JWT
from auth import hash_password, verify_password, create_token, get_current_user
from models import SupervisorRegistro, SupervisorLogin, LineaCreate, LineaUpdate
from dotenv import load_dotenv

# Carga las variables de entorno configuradas en el archivo .env
load_dotenv()

# Creacion de la aplicacion FastAPI
app = FastAPI(title="Micro-Mes API", version="1.0.0")

# Configuracion de CORS
# Permite que aplicaciones externas (Frontend)
# puedan consumir esta API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Endpoint para registrar un nuevo supervisor
@app.post("/api/auth/registro", status_code=201)
def registro(data: SupervisorRegistro, conn=Depends(get_db)):
    # se crea un cursor para ejecutar consultas SQL
    cursor = conn.cursor()
    # verifica si el correo ya existe en la base de datos
    cursor.execute("SELECT id FROM supervisores WHERE email = %s", (data.email,))
    # si ya esta registrado se lanza una excepcion
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="El email ya se encuentra registrado")
    # hace el insert
    cursor.execute(
        "INSERT INTO supervisores (nombre, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
        (data.nombre, data.email, hash_password(data.password))
    )
    # guarda los cambios en la base de datos
    conn.commit()
    return {"mensaje": "Supervisor registrado con exito"}


# endpoint para el inicio de sesion
@app.post("/api/auth/login")
def login(data: SupervisorLogin, conn=Depends(get_db)):
    # se vuelve a crear el cursor para consultar la base de datos
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nombre, password_hash FROM supervisores WHERE email = %s",
        (data.email,)
    )
    user = cursor.fetchone()
    # se verifica que el usuario existe y la contrasena es valida
    if not user or not verify_password(data.password, user[2]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    # aqui se genera el token
    token = create_token({"id": str(user[0]), "nombre": user[1], "email": data.email})
    # y se retorna el nombre del usuario y el token
    return {"token": token, "nombre": user[1]}


# funcion para calcular indicadores
def calcular_oee(linea: dict) -> dict:
    # obtiene los valores de la linea de produccion
    tp = float(linea["tiempo_planificado"])
    tpar = float(linea["tiempo_paradas"])
    cap = float(linea["capacidad_teorica"])
    up = linea["unidades_producidas"]
    ud = linea["unidades_defectuosas"]

    # se calcula el tiempo real
    tiempo_operativo = tp - tpar
    # se calcula la disponibilidad
    disponibilidad = (tiempo_operativo / tp) if tp > 0 else 0
    # el rendimiento
    rendimiento = (
        up / (tiempo_operativo * cap)
    ) if (tiempo_operativo * cap) > 0 else 0
    # la calidad
    calidad = ((up - ud) / up) if up > 0 else 0
    # el oee total
    oee = disponibilidad * rendimiento * calidad

    # clasificacion
    if oee < 0.65:
        clasificacion = "Inaceptable"
    elif oee < 0.75:
        clasificacion = "Regular"
    elif oee < 0.85:
        clasificacion = "Aceptable"
    elif oee < 0.95:
        clasificacion = "Buena"
    else:
        clasificacion = "Excelencia"

    # y se retorna la linea con sus indicadores
    return {
        **linea,
        "tiempo_operativo": round(tiempo_operativo, 2),
        "disponibilidad": round(disponibilidad * 100, 2),
        "rendimiento": round(rendimiento * 100, 2),
        "calidad": round(calidad * 100, 2),
        "oee": round(oee * 100, 2),
        "clasificacion_oee": clasificacion
    }


# crear una linea de produccion
@app.post("/api/lineas", status_code=201)
def crear_linea(data: LineaCreate, conn=Depends(get_db), user=Depends(get_current_user)):
    cursor = conn.cursor()
    # inserta la nueva linea asociada al usuario
    cursor.execute(
        """INSERT INTO lineas_produccion 
        (nombre_linea, capacidad_teorica, tiempo_planificado, tiempo_paradas,
            unidades_producidas, unidades_defectuosas, estado, usuario_creador)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (data.nombre_linea, data.capacidad_teorica, data.tiempo_planificado,
            data.tiempo_paradas, data.unidades_producidas, data.unidades_defectuosas,
            data.estado, user["id"])
    )
    # obtiene el id generado
    new_id = cursor.fetchone()[0]
    conn.commit()
    return {"mensaje": "Linea creada", "id": str(new_id)}


# endpoint para listar las lineas
@app.get("/api/lineas")
def listar_lineas(conn=Depends(get_db), user=Depends(get_current_user)):
    cursor = conn.cursor()
    # obtiene unicamente las lineas creadas por el usuario autenticado
    cursor.execute(
        """SELECT id, nombre_linea, capacidad_teorica, tiempo_planificado,
           tiempo_paradas, unidades_producidas, unidades_defectuosas, estado,
           usuario_creador, fecha_creacion
           FROM lineas_produccion WHERE usuario_creador = %s""",
        (user["id"],)
    )
    rows = cursor.fetchall()
    lineas = []
    # convierte cada registro a diccionario y calcula sus indicadores
    for row in rows:
        linea = {
            "id": str(row[0]),
            "nombre_linea": row[1],
            "capacidad_teorica": float(row[2]),
            "tiempo_planificado": float(row[3]),
            "tiempo_paradas": float(row[4]),
            "unidades_producidas": row[5],
            "unidades_defectuosas": row[6],
            "estado": row[7],
            "usuario_creador": str(row[8]),
            "fecha_creacion": str(row[9])
        }
        lineas.append(calcular_oee(linea))
    return lineas


# endpoint para actualizar una linea existente
@app.put("/api/lineas/{linea_id}")
def actualizar_linea(linea_id: str, data: LineaUpdate, conn=Depends(get_db), user=Depends(get_current_user)):
    cursor = conn.cursor()
    # verifica que la linea exista y pertenezca al usuario
    cursor.execute(
        "SELECT id FROM lineas_produccion WHERE id = %s AND usuario_creador = %s",
        (linea_id, user["id"])
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Linea no encontrada")

    # solo toma los campos que el usuario envio (no nulos)
    campos = {k: v for k, v in data.model_dump().items() if v is not None}
    if not campos:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")

    # arma el UPDATE de forma dinamica
    set_clause = ", ".join([f"{k} = %s" for k in campos.keys()])
    valores = list(campos.values()) + [linea_id]
    cursor.execute(f"UPDATE lineas_produccion SET {set_clause} WHERE id = %s", valores)
    conn.commit()
    return {"mensaje": "Linea actualizada correctamente"}


# endpoint para eliminar una linea
@app.delete("/api/lineas/{linea_id}")
def eliminar_linea(linea_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM lineas_produccion WHERE id = %s AND usuario_creador = %s",
        (linea_id, user["id"])
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Linea no encontrada")
    conn.commit()
    return {"mensaje": "Linea eliminada correctamente"}