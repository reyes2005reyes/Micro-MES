Cuestionario de Conocimientos Teóricos
A. Ecosistema Front-end (React)
1. ¿Qué es React y qué diferencias tiene respecto a frameworks estructurados como Angular o Vue.js?

    R/  React es una libreria de JavaScript desarrollada por Meta (Facebook) que se
        enfoca en la construccion de interfaces de usuario. a diferencia
        de Angular y Vue.js, React no es un framework completo sino una libreria, lo que
        significa que solo maneja la capa de la vista (lo que el usuario ve en pantalla)
        y deja al desarrollador libre de elegir las herramientas para el resto,
        enrutamiento, manejo de estado, peticiones HTTP

        Las principales diferencias son:
        -Angular es un framework completo. Incluye todo lo necesario: enrutamiento, manejo de formularios, peticiones HTTP y
        usa TypeScript de forma obligatoria y tiene una curva de aprendizaje mas alta.
        -Vue.js es un framework progresivo que busca un punto medio entre React y Angular.
        -React en cambio usa JSX, que es una extension de JavaScript que permite escribir
        HTML dentro del codigo JS. Es mas flexible.

2. Explica en qué consiste el proceso de Reconciliación (Reconciliation) y el funcionamiento del Virtual DOM en React.
    R/  Cuando el estado o las props de un componente cambian, React necesita actualizar
        lo que se muestra en pantalla. Para hacer esto de forma eficiente, React utiliza
        un concepto llamado Virtual DOM.

        El Virtual DOM es una copia ligera del DOM real (el arbol de elementos HTML que
        el navegador renderiza) que React mantiene en memoria. En lugar de modificar
        directamente el DOM real cada vez que algo cambia (lo cual es lento porque obliga
        al navegador a recalcular estilos y repintar la pantalla), React primero aplica
        los cambios sobre este Virtual DOM en memoria.


3. ¿Cuál es la diferencia entre los hooks useMemo y useCallback? Proporciona un
ejemplo práctico de cuándo usar cada uno para optimizar el rendimiento.
    R/  Ambos hooks sirven para optimizar el rendimiento evitando calculos o
        recreaciones innecesarias, pero se aplican a cosas diferentes:

        - useMemo memoriza el resultado de una funcion (un valor calculado).
        - useCallback memoriza la funcion en si misma (no la ejecuta, solo la guarda).

        useMemo se puede usar cuando tiene un calculo costoso que no deberia repetirse en cada render a menos
        que sus dependencias cambien, si quermos calcular el promedio general de OEE de todas ese calculo no deberia hacerse cada vez que el componente
        se rerenderiza por cualquier razon. Con useMemo lo calculamos solo cuando la lista de lineas cambia.

        useCallback se puede usar cuando pasas una funcion como prop a un componente hijo y no quieres que ese
        hijo se vuelva a renderizar innecesariamente porque la funcion se "recrea" en
        cada render del padre.

        La funcion handleEliminar en el Dashboard se recrea en cada render. Si la
        pasaramos como prop a una tarjeta Linea, el componente hijo se rerenderizaria
        aunque nada relevante haya cambiado. Con useCallback la estabilizamos
        con una handleEliminar funcion se mantiene estable entre renders y no causa rerenders innecesarios


4. Explica detalladamente las fases de ciclo de vida representadas por el
hook useEffect (montaje, actualización y desmontaje) y cómo se implementa la
función de limpieza (cleanup function).
    R/ En React, los componentes tienen un ciclo de vida: nacen (montaje), cambian
    (actualizacion) y mueren (desmontaje). El hook useEffect permite ejecutar codigo
    en cada una de estas fases.

    La firma basica de useEffect es:
    useEffect(() => {
        // codigo que se ejecuta
        return () => {
            // funcion de limpieza (cleanup)
        };
    }, [dependencias]);

    fase 1 - MONTAJE (cuando el componente aparece en pantalla)
    Se ejecuta cuando el array de dependencias esta vacio []. Corre una sola vez
    justo despues de que el componente se renderiza por primera vez.
    Ejemplo del proyecto: en el Dashboard cargamos las lineas al montar el componente:
    useEffect(() => {
        cargarLineas();
    }, []);
    Se ejecuta una sola vez al entrar al Dashboard

    fase 2 - ACTUALIZACION (cuando cambia una dependencia)
    Se ejecuta cada vez que alguno de los valores dentro del array de dependencias
    cambia. React compara el valor anterior con el nuevo y si son distintos, vuelve
    a ejecutar el efecto.
    Ejemplo: en el LineaForm cargamos los datos de la linea cuando el id cambia
    por si el usuario navega de editar una linea a editar otra:
    useEffect(() => {
        if (esEdicion) {
            cargarLinea();
        }
    }, [id]);
    Se ejecuta cada vez que el parametro "id" de la URL cambia

    fase 3 - DESMONTAJE (cuando el componente desaparece de pantalla)
    La funcion de limpieza (cleanup function) se ejecuta justo antes de que el
    componente se desmonte o antes de que el efecto vuelva a correr.
    Ejemplo practico con cleanup function:
    useEffect(() => {
        const controller = new AbortController();
        const cargarLineas = async () => {
            try {
                const response = await api.get("/lineas", {
                    signal: controller.signal
                });
                setLineas(response.data);
            } catch (err) {
                if (err.name !== "CanceledError") {
                    setError("No se pudo cargar las lineas");
                }
            }
        };
        cargarLineas();
        return () => {
            controller.abort(); // cancela la peticion si el componente se desmonta
        };
    }, []);
    En este ejemplo, si el usuario navega a otra pagina antes de que la peticion
    termine, el cleanup cancela la peticion automaticamente evitando errores de
    "actualizar estado en componente desmontado".

5. ¿Cómo se puede gestionar el estado global en una aplicación React sin recurrir a
librerías externas de terceros?
    R/  React incluye herramientas nativas para manejar estado global sin necesidad de
        instalar librerias. Las dos principales son Context API y
        useReducer.
        1 - Context API
        Permite crear un "contexto" que actua como un almacen global accesible desde
        cualquier componente del arbol sin necesidad de pasar props manualmente nivel
        por nivel (lo que se conoce como "prop drilling").
        Se implementa en 3 pasos:
        Paso 1 - Crear el contexto:
        Paso 2 - Envolver la app con el Provider en main.jsx:
        Paso 3 - Consumir el contexto desde cualquier componente:



        OPCION 2 - Context API + useReducer
        Cuando el estado global es mas complejo (multiples acciones que lo modifican),
        se combina Context con useReducer:
        const reducer = (state, action) => {
            switch (action.type) {
                case "LOGIN":
                    return { ...state, usuario: action.payload };
                case "LOGOUT":
                    return { ...state, usuario: null };
                default:
                    return state;
            }
        };

        Aplicacion en el proyecto:
        En este proyecto se uso localStorage para persistir el token JWT y el nombre
        del usuario entre recargas de pagina, lo cual es una forma simple de estado
        global sin Context. Sin embargo, para una aplicacion mas grande lo ideal seria
        usar Context API para centralizar el estado de autenticacion y evitar leer
        localStorage directamente en cada componente.

6. ¿Cuál es la diferencia entre componentes controlados y no controlados en React al
trabajar con formularios?
    R/  La diferencia esta en quien controla el valor de los campos del formulario:
        en los componentes controlados lo controla React, y en los no controlados lo
        controla el DOM directamente.
        COMPONENTES CONTROLADOS
        El valor de cada input esta vinculado a un estado de React mediante useState.
        Cada vez que el usuario escribe algo, se dispara el evento onChange que actualiza
        el estado, y React re-renderiza el componente con el nuevo valor.
        Ejemplo del proyecto (Login.jsx):
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        En este caso React sabe en todo momento exactamente que tiene escrito el usuario
        en cada campo. Esto permite validar en tiempo real, deshabilitar botones segun
        el contenido, o resetear el formulario facilmente con setEmail("").


        COMPONENTES NO CONTROLADOS
        El valor del input lo maneja el DOM directamente, no React. Se usa una referencia
        (useRef) para leer el valor solo cuando se necesita, por ejemplo al enviar el
        formulario.

        Ejemplo:

        import { useRef } from "react";

        function FormularioNoControlado() {
            const emailRef = useRef();

            const handleSubmit = (e) => {
                e.preventDefault();
                console.log(emailRef.current.value); // se lee solo al enviar
            };
            return (
                <form onSubmit={handleSubmit}>
                    <input type="email" ref={emailRef} />
                    <button type="submit">Enviar</button>
                </form>
            );
        }
        
7. ¿Para qué sirven las "Keys" al renderizar listas en React y por qué se desaconseja
utilizar el índice del arreglo como key?
    R/  Las Keys son atributos especiales que React usa para identificar de forma
        unica cada elemento dentro de una lista renderizada. Le permiten a React saber
        exactamente que elemento cambio, se agrego o se elimino durante el proceso de
        Reconciliacion, sin tener que comparar todos los elementos uno por uno.

        Sin keys, React no sabria cual elemento es cual y tendria que volver a renderizar
        toda la lista completa ante cualquier cambio. Con keys, React puede hacer
        actualizaciones quirurgicas y eficientes.
        Ejemplo del proyecto en Dashboard.jsx:
        {lineas.map((linea) => (
            <div key={linea.id} className="linea-card">
                <h3>{linea.nombre_linea}</h3>
            </div>
        ))}

        Aqui se usa linea.id (un UUID unico de la base de datos) como key. Esto le
        permite a React identificar cada tarjeta de forma inequivoca.

8. ¿Qué es un Custom Hook y en qué escenarios resulta útil crearlo?
    R/  Un Custom Hook es una funcion de JavaScript, puede usar otros hooks de React adentro.
        Sirve para extraer logica reutilizable de los componentes y evitar repetir el mismo codigo en varios lugares.
        React no distingue entre sus hooks nativos y los custom hooks, la unica regla
        es que el nombre debe empezar con "use" para que React pueda aplicar las mismas
        reglas de los hooks.
        CUANDO ES UTIL CREARLO
        1. Cuando la misma logica se repite en varios componentes
        2. Cuando un componente tiene demasiada logica mezclada con el JSX y se quiere
        separar para que sea mas legible
        EJEMPLO PRACTICO CON EL PROYECTO
        En el Dashboard y en el LineaForm ambos hacen una peticion GET a /lineas.
        Esa logica se podria extraer a un custom hook llamado useLineas

9. ¿Cómo funciona el mecanismo de React.Suspense y la carga perezosa (lazy) para la
división de código (code splitting)?
    R/  Por defecto, cuando se construye una aplicacion React, todo el codigo JavaScript se empaqueta en un solo archivo grande.
        Esto significa que el navegador debe descargar y procesar TODO el codigo antes de
        mostrar algo al usuario, aunque solo vaya a usar una parte de la aplicacion.
        Code Splitting es la tecnica que divide ese archivo grande en partes mas pequeñas
        que se cargan solo cuando se necesitan. React implementa esto con dos herramientas
        nativas: React.lazy y React.Suspense.
        REACT.LAZY
        Permite importar un componente de forma dinamica, solo se descarga
        del servidor cuando el usuario realmente va a verlo.
        Importacion normal (carga todo desde el inicio):
        import Dashboard from "./pages/Dashboard";
        import LineaForm from "./pages/LineaForm";
        Importacion con lazy (carga solo cuando se necesita):
        import { lazy } from "react";
        const Dashboard = lazy(() => import("./pages/Dashboard"));
        const LineaForm = lazy(() => import("./pages/LineaForm"));
        REACT.SUSPENSE
        Como la carga lazy es asincrona, hay un momento en que el componente aun no
        esta listo para mostrarse. React.Suspense permite definir que mostrar durante
        ese tiempo de espera mediante el prop "fallback".

10. ¿Cómo manejas las condiciones de carrera (race conditions) que ocurren cuando se
realizan múltiples peticiones asíncronas consecutivas dentro de un useEffect?
    R/  Una condicion de carrera ocurre cuando se lanzan varias peticiones consecutivas
        y la respuesta de una peticion antigua llega despues que la de una peticion nueva,
        pisando datos correctos con datos desactualizados.

        Ejemplo del problema:
        El usuario escribe "Lin" en un buscador → se lanza peticion 1
        El usuario escribe "Linea" rapidamente → se lanza peticion 2
        La peticion 2 responde primero con los datos correctos
        La peticion 1 responde despues y pisa los resultados con datos incorrectos
        SOLUCION - AbortController
        La forma nativa de resolver esto en JavaScript es usando AbortController, que
        permite cancelar una peticion HTTP pendiente cuando ya no se necesita.

        useEffect(() => {
        const controller = new AbortController();

        const cargarLineas = async () => {
            try {
                const response = await api.get("/lineas", {
                    signal: controller.signal
                });
                setLineas(response.data);
            } catch (err) {
                if (err.name !== "CanceledError") {
                    setError("No se pudieron cargar las lineas");
                }
            }
        };

        cargarLineas();

        return () => {
            controller.abort();
        };
    }, [busqueda]);
    Cada vez que "busqueda" cambia, el cleanup cancela la peticion anterior antes
    de lanzar la nueva. Asi solo la ultima peticion puede actualizar el estado.









    B. Python, FastAPI y Bases de Datos (PostgreSQL sin ORM)
1. ¿Qué es FastAPI y en qué se diferencia de frameworks tradicionales de Python como
Django o Flask (mencione ASGI y WSGI)?
    R/  FastAPI es un framework moderno de Python para construir APIs REST de forma
        rapida y eficiente.
        DIFERENCIAS PRINCIPALES

        Django:
        - Framework completo que incluye ORM, panel de administracion, autenticacion,
        sistema de plantillas HTML y muchas cosas mas
        - Ideal para aplicaciones web tradicionales completas
        - Usa WSGI por defecto (aunque soporta ASGI desde Django 3.0)
        - Curva de aprendizaje alta por la cantidad de conceptos que maneja
        - Mucho mas pesado y estructurado
        Flask:
        - Framework minimalista que solo da lo basico para crear rutas y respuestas HTTP
        - El desarrollador elige cada herramienta adicional que necesite
        - Tambien usa WSGI por defecto
        - Mas sencillo que Django pero sin validacion automatica ni documentacion generada
        FastAPI:
        - Framework moderno enfocado exclusivamente en APIs REST
        - Usa ASGI de forma nativa, lo que le permite manejar peticiones asincronas
        de forma eficiente
        - Genera documentacion interactiva automatica en /docs (Swagger UI)
        - Valida automaticamente los datos de entrada y salida usando Pydantic
        - Es uno de los frameworks Python mas rapidos disponibles hoy

        WSGI vs ASGI
        WSGI (Web Server Gateway Interface) es el estandar tradicional de Python para
        comunicar servidores web con aplicaciones. Es sincrono, lo que significa que
        maneja una peticion a la vez por hilo. Django y Flask usan WSGI.
        ASGI (Asynchronous Server Gateway Interface) es el estandar moderno que permite
        manejar multiples peticiones de forma asincrona sin bloquear el servidor mientras
        espera respuestas de la base de datos u otros servicios. FastAPI usa ASGI a traves
        del servidor Uvicorn, que es el que se levanta con el comando:

2. ¿Qué rol desempeñan los Type Hints (tipado estático dinámico) de Python y la
librería Pydantic dentro del ecosistema de FastAPI?
    R/  Type Hints (anotaciones de tipo) que indican que tipo de dato se espera en cada variable,
        es un retorno de funcion. Esto no cambia el comportamiento del codigo en
        tiempo de ejecucion, pero ayuda a los editores de codigo a detectar errores y
        hace el codigo mas legible.
        def saludar(nombre: str, edad: int) -> str:
            return f"Hola {nombre}, tienes {edad} años"
        Aqui se indica que nombre debe ser str, edad debe ser int y la funcion retorna str.
        FastAPI usa los Type Hints de forma activa, no solo como documentacion. Cuando
        defines una ruta con parametros tipados, FastAPI los usa para:
        - Validar automaticamente los datos que llegan en la peticion
        - Convertir tipos automaticamente (por ejemplo, un "1" de la URL se convierte a int)
        Ejemplo del proyecto:
        @app.delete("/api/lineas/{linea_id}")
        def eliminar_linea(linea_id: str, ...):
            # FastAPI sabe que linea_id debe ser un string
        Pydantic es la libreria que FastAPI usa internamente para la validacion de datos.
        Permite definir modelos (clases que heredan de BaseModel) donde cada campo tiene
        un tipo declarado. Cuando llega una peticion, FastAPI usa Pydantic para validar
        que el cuerpo JSON tenga la estructura y tipos correctos antes de ejecutar el
        endpoint.
        Ejemplo del proyecto en models.py:
        from pydantic import BaseModel
        class LineaCreate(BaseModel):
            nombre_linea: str
            capacidad_teorica: float
            tiempo_planificado: float
            tiempo_paradas: float = 0
            unidades_producidas: int = 0
            unidades_defectuosas: int = 0
            estado: str = "Activa"
        Si el cliente envia un JSON con capacidad_teorica: "diez" (texto en lugar de
        numero), Pydantic rechaza automaticamente la peticion con un error 422 antes de
        que el codigo del endpoint se ejecute.

3. Explica cómo funciona la concurrencia basada en async y await en Python. ¿Cuándo
se debe definir una ruta de FastAPI como async def frente a un def clásico?
    R/  Por defecto Python ejecuta una instruccion a la vez. El problema es que
        operaciones como consultas a BD o peticiones HTTP implican tiempo de espera,
        bloqueando el programa. async/await resuelve esto permitiendo pausar una funcion
        mientras espera y atender otras tareas en ese tiempo.

        async def marca una funcion como asincrona.
        await pausa la funcion en ese punto hasta que la operacion lenta termine.
        Ejemplo:
        async def obtener_datos():
            await asyncio.sleep(2)  # pausa aqui, atiende otras cosas mientras espera
            return {"datos": "resultado"}
        CUANDO USAR CADA UNA EN FASTAPI
        async def, cuando se usan librerias asincronas
        @app.get("/externo")
        async def consultar_api_externa():
            async with httpx.AsyncClient() as client:
                response = await client.get("https://api.externa.com")
            return response.json()
        def clasico, cuando se usan librerias sincronas como psycopg2 (usado en
        este proyecto). FastAPI lo ejecuta en un threadpool separado automaticamente:
        @app.get("/api/lineas")
        def listar_lineas(conn=Depends(get_db)):
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM lineas_produccion")
            return cursor.fetchall()
        Regla practica:
        - Libreria asincrona → async def
        - Libreria sincrona  → def clasico

4. ¿Qué es y cómo funciona el sistema de Inyección de Dependencias (Depends) en
FastAPI? Da un ejemplo de uso (ej. autenticación o conexión a DB).
    R/  La Inyeccion de Dependencias es un mecanismo que permite que FastAPI resuelva
        y suministre automaticamente los recursos que un endpoint necesita antes de
        ejecutarse, como una conexion a la base de datos o el usuario autenticado.

        Se implementa con Depends(). FastAPI detecta los parametros marcados con Depends,
        ejecuta la funcion indicada y pasa su resultado al endpoint automaticamente.
        Ejemplo del proyecto - conexion a DB:
        def get_db():
            conn = get_connection()
            try:
                yield conn
            finally:
                conn.close()
        @app.get("/api/lineas")
        def listar_lineas(conn=Depends(get_db), user=Depends(get_current_user)):
            # conn ya viene listo para usar, se cierra automaticamente al terminar
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM lineas_produccion WHERE usuario_creador = %s",
                        (user["id"],))
            return cursor.fetchall()
        En este proyecto se usaron dos dependencias en cada endpoint protegido:
        - Depends(get_db), abre y cierra la conexion a PostgreSQL
        - Depends(get_current_user) → valida el token JWT y retorna el usuario autenticado


5. ¿Qué es el Global Interpreter Lock (GIL) en Python y cómo influye en el rendimiento
de un servicio backend cuando se procesan tareas intensivas de CPU?
    R/  El GIL es un mecanismo interno de Python que permite que solo un hilo ejecute
        codigo Python a la vez, incluso en procesadores con multiples nucleos. Fue creado
        para proteger la memoria interna del interprete de Python de accesos simultaneos
        que podrian corromper datos.

        COMO AFECTA AL BACKEND

        En tareas de I/O (consultas a BD, peticiones HTTP):
        El GIL no es un problema porque mientras un hilo espera la respuesta de la base
        de datos, libera el GIL y otros hilos pueden ejecutarse. Por eso FastAPI con
        async/await funciona bien para APIs con muchas peticiones concurrentes.

        En tareas intensivas de CPU (calculos pesados, procesamiento de imagenes):
        El GIL si es un problema porque aunque se creen multiples hilos, solo uno puede
        ejecutar codigo Python a la vez. Los demas hilos quedan bloqueados esperando,
        lo que anula el beneficio del multiprocesamiento.


6. Explica la diferencia entre las estructuras de datos list y tuple en Python en términos
de mutabilidad y rendimiento de memoria.
    R/  La diferencia principal es la mutabilidad:
        list es mutable: se puede modificar despues de crearse.
        lineas = ["Linea A", "Linea B"]
        lineas.append("Linea C") # permitido
        lineas[0] = "Linea X" # permitido
        tuple es inmutable: no se puede modificar una vez creada.
        coordenadas = (4.7110, -74.0721)
        coordenadas[0] = 5.0  # ERROR
        RENDIMIENTO
        Los tuples ocupan menos memoria y se crean mas rapido porque Python sabe que
        nunca van a cambiar y los optimiza internamente.
        Ejemplo del proyecto: psycopg2 retorna cada fila de la BD como un tuple
        porque los datos de una fila no deben modificarse directamente.

7. ¿Qué es un generador (yield) en Python y cómo se utiliza de manera eficiente para
manejar la apertura y cierre de conexiones a bases de datos en FastAPI?
    R/  Un generador es una funcion que usa yield en lugar de return. La diferencia es
        que yield pausa la funcion en ese punto, entrega el valor, y cuando se le pide
        continua desde donde se quedo. Esto permite controlar exactamente que pasa antes
        y despues de entregar el valor.
        USO EN FASTAPI PARA CONEXIONES A BD
        FastAPI aprovecha los generadores con yield para abrir y cerrar conexiones
        automaticamente en cada peticion:
        def get_db():
            conn = get_connection()  # abre la conexion
            try:
                yield conn # entrega la conexion al endpoint
            finally:
                conn.close()# cierra la conexion al terminar
        El bloque finally garantiza que la conexion se cierra aunque el endpoint
        falle con un error. Esto evita conexiones se saturen es PostgreSQL.


8. En un entorno donde no se utiliza un ORM, ¿cómo se previenen los ataques
de Inyección SQL (SQLi) al ejecutar sentencias dinámicas en PostgreSQL desde
Python?
    R/  La inyeccion SQL ocurre cuando un atacante inserta codigo SQL malicioso en
        los datos que envia, logrando manipular las consultas de la base de datos.
        Ejemplo del ataque:
        email = "admin' OR '1'='1"
        cursor.execute(f"SELECT * FROM supervisores WHERE email = '{email}'")
        # La consulta resultante seria:
        # SELECT * FROM supervisores WHERE email = 'admin' OR '1'='1'
        # Esto retorna TODOS los usuarios sin necesitar contraseña
        SOLUCION - Consultas parametrizadas
        La unica forma correcta de prevenirlo es usando parametros (%s) en lugar de
        concatenar strings directamente. psycopg2 se encarga de escapar los valores
        automaticamente.
        # lo que estaria mal - vulnerable a SQLi
        cursor.execute(f"SELECT * FROM supervisores WHERE email = '{email}'")

        # lo que estaria bueno - consulta parametrizada, segura
        cursor.execute("SELECT * FROM supervisores WHERE email = %s", (email,))
        Los valores se pasan como una tupla separada del SQL. psycopg2 los trata como
        datos puros, nunca como codigo SQL ejecutable.
        Ejemplo del proyecto en main.py:
        cursor.execute(
            "INSERT INTO supervisores (nombre, email, password_hash) VALUES (%s, %s, %s)",
            (data.nombre, data.email, hash_password(data.password))
        )
9. ¿Qué es el Connection Pooling (Pool de conexiones), por qué es fundamental
implementarlo al interactuar directamente con PostgreSQL y qué herramientas o
módulos de Python lo facilitan (ej. pool en psycopg o asyncpg)?
    R/  Es como tener un equipo de meseros listos en la cocina de un restaurante, en lugar de contratar y despedir a un mesero nuevo cada vez que entra un solo cliente.
        ¿Por qué es fundamental con PostgreSQL?
        Evita la lentitud: Abrir una conexión desde cero obliga al servidor a verificar contraseñas cada vez, lo cual es muy pesado.
        Previene apagones: Si miles de usuarios entran a la vez y abren conexiones nuevas, la base de datos se satura y se cae.
        Reutiliza recursos: El pool mantiene conexiones abiertas; tu código pide una prestada por milisegundos y la devuelve de inmediato.

10. ¿Cómo recomiendas gestionar variables de entorno delicadas (como credenciales de
base de datos o secretos JWT) en una aplicación backend con FastAPI?
    R/  Las credenciales y secretos JWT se almacenan en un archivo de texto plano externo llamado
        .env, el cual se lee en memoria al arrancar el servidor y jamas se sube al repositorio de codigo.
        ¿Por qué es fundamental con FastAPI?Evita filtraciones:
        Al separar las contraseñas del codigo fuente, impides que se expongan publicamente en plataformas como GitHub.
        Te permite cambiar las credenciales de la base de datos segun el entorno (desarrollo, pruebas o produccion)
        sin modificar una sola línea de codigo. FastAPI aprovecha el tipado de Python para validar que
        las variables criticas existan y tengan el formato correcto antes de que la aplicacion empiece a correr.