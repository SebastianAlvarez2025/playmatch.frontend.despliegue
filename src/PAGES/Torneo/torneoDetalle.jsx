// ===================================================================
// TorneoDetalle.jsx
// Decide qué vista del detalle de un torneo mostrar según el rol
// del usuario logueado.
// ===================================================================

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import TorneoDetalleOrganizador from "./TorneoDetalleOrganizador";
import TorneoDetalleUsuario from "./TorneoDetalleUsuario";
import TorneoDetallejugador from "./TorneoDetallejugador";

export default function TorneoDetalle() {
  const { user } = useContext(AuthContext);

  if (user?.rol === ROLES.ORGANIZADOR || user?.rol === ROLES.ADMINISTRADOR || ROLES.SUPERADMINISTRADOR) {
    return <TorneoDetalleOrganizador />;
  }

  // Jugador y Entrenador (DT) ven el mismo detalle: solo consultan
  // el torneo, no lo administran.
  if (user?.rol === ROLES.JUGADOR || user?.rol === ROLES.ENTRENADOR) {
    return <TorneoDetallejugador />;
  }

  if (user?.rol === ROLES.INVITADO || !user) {
    return <TorneoDetalleUsuario />;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>No tienes acceso a esta sección o el rol no es válido.</p>
    </div>
  );
}