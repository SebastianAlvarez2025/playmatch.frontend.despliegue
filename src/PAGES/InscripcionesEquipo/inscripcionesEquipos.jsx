import { useContext } from "react";
import { useParams } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import InscripcionesEquiposAdmin from "./InscripcionesEquiposAdmin";
import InscripcionesEquiposOrganizador from "./InscripcionesEquiposOrganizador";
import InscripcionesEquiposEntrenador from "./inscripcionesEquiposEntrenador";

export default function InscripcionesEquipos() {
  const { user } = useContext(AuthContext);

  const { id_torneo, id } = useParams();

  // Puede venir de /inscripcionEquipos/torneo/:id_torneo
  // o de otra ruta que utilice :id
  const idTorneo = id_torneo || id || null;

  console.log("=================================");
  console.log("USUARIO:", user);
  console.log("ID TORNEO:", idTorneo);
  console.log("=================================");

  // ==========================================================
  // ADMINISTRADOR
  // ==========================================================

  if (
    user?.rol === ROLES.ADMINISTRADOR ||
    user?.rol === ROLES.SUPERADMINISTRADOR
  ) {
    return <InscripcionesEquiposAdmin idTorneo={idTorneo} />;
  }

  // ==========================================================
  // ORGANIZADOR
  // ==========================================================

  if (user?.rol === ROLES.ORGANIZADOR) {
    return <InscripcionesEquiposOrganizador idTorneo={idTorneo} />;
  }

  // ==========================================================
  // ENTRENADOR
  // ==========================================================

  if (user?.rol === ROLES.ENTRENADOR) {
    return <InscripcionesEquiposEntrenador idTorneo={idTorneo} />;
  }

  // ==========================================================
  // SIN PERMISOS
  // ==========================================================

  return (
    <div>
      <h2>No tienes permisos para consultar las inscripciones.</h2>
    </div>
  );
}
