//para manejar estados y efectos secundarios
import { useState, useEffect } from "react";
//para navegar entre rutas de la aplicación
import { Navigate, useNavigate } from "react-router-dom";
//para consumir la API
import api from "../api/cliente";

//Componente Dashboard
function Deshboard(){
    //Estado que almacena las líneas de produccion
    const [lineas, setLineas] = useState([]);

    const [error, setError] = useState("");
    const navigate = useNavigate();
    //Obtiene el nombre del usuario almacenado
    const nombre = localStorage.getItem("nombre");


    //Cargar líneas de produccion desde la API
    const cargarLineas = async () => {
        try {
            //Solicita todas las lineas de produccion
            const response = await api.get("/lineas");
            setLineas(response.data);
        } catch (err) {
            setError("No se pudo cargar las lineas");
            
        }
    };

     //Ejecutar al cargar el componente
    useEffect(() => {
        cargarLineas();
    }, []);
    
     //Cerrar sesion
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nombre");
        navigate("/");
    };

      //Eliminar una linea de produccion
    const handleEliminar = async (id) => {
        if(!window.confirm("¿Seguro que lo desea eliminar?")) return;
        try {
             //Envia la solicitud de eliminacion
            await api.delete(`/lineas/${id}`);
            cargarLineas();
        } catch (error) {
            setError("No se pudo eliminar la linea de produccion");
            
        }
    };

     //Asignar color segin la clasificacion
    const colorClasificacion = (clasificacion) => {
        const colores = {
            Inaceptable: "rojo",
            Regular: "naranja",
            Aceptable: "amarillo",
            Buena: "azul",
            Excelencia: "verde",
        };
        return colores[clasificacion] || "gris";
    };

       //Renderizado del componente
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Micro-Mes</h2>
                <div className="header-right">
                    <span>Hola, {nombre}</span>
                    <button onClick={() => navigate("/lineas/nueva")}>Nueva Linea</button>
                    <button onClick={handleLogout} className="btn-logout">Salir</button>
                </div>
            </header>

            {error && <p className="error-msg">{error}</p>}

            <div className="lineas-grid">
                {lineas.map((linea) => (
                    <div key={linea.id} className={`linea-card borde-${colorClasificacion(linea.clasificacion_oee)}`}>
                        <div className="linea-card-top">
                            <h3>{linea.nombre_linea}</h3>
                            <span className={`badge badge-${colorClasificacion(linea.clasificacion_oee)}`}>
                                {linea.clasificacion_oee}
                            </span>
                        </div>
                        <div className="oee-numero">
                            {linea.oee}% <span>OEE</span>
                        </div>
                        <div className="linea-detalles">
                            <p>Disponibilidad: {linea.disponibilidad}</p>
                            <p>Rendimiento: {linea.rendimiento}</p>
                            <p>Calidad: {linea.calidad}</p>
                        </div>
                        <div className="linea-acciones">
                            <button onClick={() => navigate(`/lineas/${linea.id}/editar`)}>Editar</button>
                            <button onClick={() => handleEliminar(linea.id)} className="btn-danger">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            {lineas.length === 0 && !error && (
                <p className="empty-msg">No hay lineas de producción registradas</p>
            )}
        </div>
    );
}
export default Deshboard;