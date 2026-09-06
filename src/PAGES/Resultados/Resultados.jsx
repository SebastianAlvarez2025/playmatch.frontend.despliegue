import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import ResultadoAdmin from "./ResultadoAdmin";
import ResultadoOrganizador from "./ResultadoOrganizador";
import ResultadoJugador from "./ResultadoJugador";

export default function Resultados() {
  const { user, loading } = useContext(AuthContext); // Asumiendo que manejas un estado loading en tu AuthContext

  // Controlamos el estado de carga para evitar renderizar la vista incorrecta por defecto
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
        Cargando resultados...
      </div>
    );
  }

  // Si no hay usuario autenticado, protegemos la vista
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
        Acceso denegado. Por favor, inicia sesión.
      </div>
    );
  }

  // Renderizado exacto según el árbol de Roles de Play Match
  if (user.rol === ROLES.ADMINISTRADOR) {
    return <ResultadoAdmin />;
  }

  // Se corrige el bug: ROLES.USUARIO no existe en constants/roles.js
  // Se agrega ROLES.ENTRENADOR de forma explicita, para que el Director Tecnico
  // vea el mismo panel que el Jugador (solo consulta de resultados de su equipo)
  if (user.rol === ROLES.JUGADOR || user.rol === ROLES.ENTRENADOR) {
    return <ResultadoJugador />;
  }

  // Si no es admin ni jugador/entrenador, por descarte es organizador
  return <ResultadoOrganizador />;
}