import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import CronologiasAdmin from "./CronologiasAdmin";
import CronologiasOrganizador from "./CronologiasOrganizador";

export default function Cronologias() {
  const { user, loading } = useContext(AuthContext); // Si tienes un estado loading en tu AuthContext

  // 1. Control preventivo: Si tu AuthContext maneja un estado de carga mientras recupera la sesión
  if (loading) {
    return <div className="cargando">Cargando módulo...</div>; 
  }

  // 2. Control de seguridad: Si no hay usuario autenticado, redirigir o mostrar un mensaje seguro
  if (!user) {
    return <div className="no-autorizado">No tienes permisos para ver esta sección.</div>;
  }

  // 3. Renderizado condicional según el Rol establecido
  if (user.rol === ROLES.ORGANIZADOR) {
    return <CronologiasOrganizador />;
  }

  // Si no es Organizador, por defecto asume que es Admin (o puedes validar explícitamente user.rol === ROLES.ADMIN)
  return <CronologiasAdmin />;
}