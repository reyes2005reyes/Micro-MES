//para manejar estados y efectos secundarios
import { useState, useEffect } from "react";
//para navegar entre rutas de la aplicación
import { useNavigate } from "react-router-dom";
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
    const colorClasificacion = (clasificacuion) => {
        const colores = {
            Inaceptable: "rojo",
            Regular: "naranja",
            Aceptable: "amarillo",
            Buena: "azul",
            Excelencia: "verde",
        };
        return colores[colorClasificacion] || "gris";
    };

       //Renderizado del componente
    return (
        <div>

        </div>
    )
}