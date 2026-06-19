//para manejar estados dentro del componente
import { useState } from "react";
//para navegar entre páginas
import { useNavigate } from "react-router-dom";
//Instancia personalizada de Axios configurada para consumir la API
import api from "../api/cliente";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        //evita que la pagina se recargue al enviar el formulario
        e.preventDefault();
        setError("");
        try {
            //envia las credenciales al endpoint de autenticacion
            const response = await api.post("/auth/login", {email, password});
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("nombre", response.data.nombre);
            navigate("/deshboard"); 
        } catch (error) {
            setError("Credenciales incorrectas");
        }
    };
    //Interfaz del formulario de inicio de sesión
    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">

                <h2>Micro-Mes</h2>
                <p>Iniciar Sesion</p>

                <input type="email" placeholder="Tu correo electronico" value={email} onChange={(e) => setEmail(e.target.value)} required/>

                <input type="password" placeholder="Tu contaseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && <p className="error-msg">{error}</p>}
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
    
}
export default Login;