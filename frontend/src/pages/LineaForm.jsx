//para manejar estados y efectos secundarios
import { useState, useEffect } from "react";
//React Router para navegacion y parámetros de URL
import { useNavigate, useParams } from "react-router-dom";
//cliente Axios configurado para consumir la API
import api from "../api/cliente";


//componente para crear o editar lineas de produccion
function LineaForm(){
    //Obtiene el parametro id desde la UR
    const {id} = useParams();
    //determinar si el formulario esta en modo edicion
    const esEdicion = Boolean(id);
    //permite navegar estre rutas
    const navigate = useNavigate();
    //almacena los datos del formulario
    const [form, setForm] = useState({
        nombre_linea: "",
        capacidad_teorica: "",
        tiempo_planificado: "",
        tiempo_paradas: "",
        unidades_producidas: "",
        unidades_defectuosas: "",
        estado: "Activa",
    });
    //estado para mostrar un eror
    const [error, setError] = useState("");
    //para la carga de datos
    const [cargando, setCargando] = useState(esEdicion);

    //carga la informacion de la linea al editar
    useEffect(() => {
        if(esEdicion){
            cargarLinea();
        }
    }, [id]);

    //obtiene la linea seleccionada desde la api
    const cargarLinea = async () => {
    try {
        //obtiene todas las lineas registradas
        const response = await api.get("/lineas");
        //busca la linea correspondiente al id reciido
        const linea = response.data.find((l) => l.id === id);
            if (linea) {
                setForm({
                nombre_linea: linea.nombre_linea,
                capacidad_teorica: linea.capacidad_teorica,
                tiempo_planificado: linea.tiempo_planificado,
                tiempo_paradas: linea.tiempo_paradas,
                unidades_producidas: linea.unidades_producidas,
                unidades_defectuosas: linea.unidades_defectuosas,
                estado: linea.estado,
                });
            }
        
        } catch (err) {
        //muestra el error si no puee obtener la informacion
        setError("No se pudo cargar la línea");
        } finally {
        //finaliza el estado de carga
        setCargando(false);
        }
    };
    //se actualiza el estado cuando cambia un campo
    const handleChange = async (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };
    
    //envia el formulario al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        //convierte los valores numericos al tipo edecuado
        const payload = {
        ...form,
        capacidad_teorica: parseFloat(form.capacidad_teorica),
        tiempo_planificado: parseFloat(form.tiempo_planificado),
        tiempo_paradas: parseFloat(form.tiempo_paradas),
        unidades_producidas: parseInt(form.unidades_producidas),
        unidades_defectuosas: parseInt(form.unidades_defectuosas),
        };

        try {
            //si existe el id se actualiza la linea
            if(esEdicion){
                await api.put(`/lineas/${id}`, payload);
            }else{
                //si no crea una nueva linea
                await api.post("/lineas", payload);
            }
            navigate("/dashboard");
        } catch (err) {
            setError("No se pudo guardar la linea de produccion");
        }
    };
    //el indicador de carga
    if(cargando) 
        return <p className="loading-msg">Cargando..</p>
        // Renderizado del formulario
    return (
        <div className="form-container">
        <form onSubmit={handleSubmit} className="linea-form">
            <h2>{esEdicion ? "Editar linea" : "Nueva linea de produccion"}</h2>

            <label>Nombre de la línea</label>
            <input type="text" name="nombre_linea" value={form.nombre_linea} onChange={handleChange} placeholder="Ejemplo: Línea de Envasado 1"
            required/>

            <label>Capacidad teórica (piezas/min)</label>
            <input type="number" step="0.01" name="capacidad_teorica" value={form.capacidad_teorica} onChange={handleChange}
            required/>

            <label>Tiempo planificado (min)</label>
            <input type="number" step="0.01" name="tiempo_planificado" value={form.tiempo_planificado} onChange={handleChange}
            required/>

            <label>Tiempo de paradas (min)</label>
            <input type="number" step="0.01" name="tiempo_paradas" value={form.tiempo_paradas} onChange={handleChange}
            required/>

            <label>Unidades producidas</label>
            <input type="number" name="unidades_producidas" value={form.unidades_producidas} onChange={handleChange}
            required/>

            <label>Unidades defectuosas</label>
            <input type="number" name="unidades_defectuosas" value={form.unidades_defectuosas} onChange={handleChange}
            required/>

            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            </select>

            {error && <p className="error-msg">{error}</p>}

            <div className="form-acciones">
            <button type="submit">{esEdicion ? "Guardar cambios" : "Crear línea"}</button>
            <button type="button" onClick={() => navigate("/dashboard")} className="btn-secundario">
                Cancelar
            </button>
            </div>
        </form>
        </div>
    );
}
export default LineaForm;