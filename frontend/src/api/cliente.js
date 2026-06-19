//Importa la libreria Axios para realizar peticiones HTTP
import axios from "axios";

//Configuracion de la instancia principal de Axios
//Se crea una instancia personalizada para evitar repetir la URL base en cada peticion.
const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

//Se ejecuta automaticamente antes de cada peticion para agregar el token de autenticación si existe.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

