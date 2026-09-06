import { useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import EncuentrosAdmin from "./EncuentrosAdmin";
import EncuentrosOrganizador from "./EncuentrosOrganizador";
import EncuentrosJugador from "./EncuentrosJugador";

export default function Encuentros() {
  const { user } = useContext(AuthContext);
  // Capturamos el id del torneo desde la URL para pasárselo de forma limpia a los subcomponentes
  const { id } = useParams(); 

  // Vista para el Administrador global del sistema
  if (user?.rol === ROLES.ADMINISTRADOR) {
    return <EncuentrosAdmin idTorneo={id} />;
  }

  // Vista para el Organizador del torneo específico
  if (user?.rol === ROLES.ORGANIZADOR) {
    return <EncuentrosOrganizador idTorneo={id} />;
  }

  // Vista por defecto para Jugadores o Público en general
  return <EncuentrosJugador idTorneo={id} />;
}