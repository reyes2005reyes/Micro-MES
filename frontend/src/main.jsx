//importamos StrictMode para detectar posibles problemas
import { StrictMode } from "react";
//funcion para crear el punto de montaje de React
import { createRoot } from "react-dom/client";
//importa los estilos globales de la aplicacion
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);