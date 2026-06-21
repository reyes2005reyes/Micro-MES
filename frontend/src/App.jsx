//Componenetes necesarios para manejar las rutas
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//paginas de la aplicacion
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LineaForm from "./pages/LineaForm";
import "./App.css"

//componenete para porteguer rutas privadas
//verifica si existe un token de autenticacion si existe, permite acceder a la ruta de lo contrario, redirige al login.
function RutaProtegida({children}){
  //obtiene el token almacenado en el navegador
    const token = localStorage.getItem("token");
    //Si existe el token muestra el componente de lo contrario redirige al login.
    return token ? children : <Navigate to="/" />;
}
//todos los componentes de la aplicacion
function App() {
  return (
    //se habilita el siste de las rutas em la aplicacion
    <BrowserRouter>
      <Routes>
        {/*ruta publica del incio de session*/}
        <Route path="/" element={<Login />} />
        {/*ruta protegida del deshboard*/}
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />
        {/*ruta protegida para crear una linea de produccion */}
        <Route
          path="/lineas/nueva"
          element={
            <RutaProtegida>
              <LineaForm />
            </RutaProtegida>
          }
        />
        {/*ruta protegida para editar una linea de produccion*/}
        <Route
          path="/lineas/:id/editar"
          element={
            <RutaProtegida>
              <LineaForm />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
// y exporta el componente prinmcipal
export default App;