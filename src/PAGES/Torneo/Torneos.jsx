// ===================================================================
// Torneos.jsx
// Decide qué vista de Torneos mostrar según el rol del usuario
// logueado (Administrador, Organizador, Jugador o Entrenador/DT).
// ===================================================================

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import TorneosAdmin from "./TorneosAdmin";
import TorneosOrganizador from "./TorneosOrganizador";
import TorneosJugador from "./TorneosJugador";

export default function Torneos() {
  const { user } = useContext(AuthContext);

  // Función interna para renderizar según el rol
  const renderContenidoPorRol = () => {

    if (user?.rol === ROLES.SUPERADMINISTRADOR || user?.rol === ROLES.ADMINISTRADOR || user?.rol === ROLES.VEEDOR || user?.rol === ROLES.JUGADOR || user?.rol === ROLES.ENTRENADOR || user?.rol === ROLES.ORGANIZADOR) {
      return <TorneosJugador />;
    }
    
    return (
      <p style={{ color: "white", textAlign: "center", padding: "20px" }}>
        Cargando torneos o acceso no autorizado...
      </p>
    );
  };

  // Envolvemos el resultado en un contenedor con scroll asegurado
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {renderContenidoPorRol()}
    </div>
  );
}