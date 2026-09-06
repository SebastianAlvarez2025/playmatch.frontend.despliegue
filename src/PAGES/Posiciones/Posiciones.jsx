import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import PosicionesAdmin from "./PosicionesAdmin";
import PosicionesOrganizador from "./PosicionesOrganizador";

export default function Posiciones() {
  // Extraemos user y también loading (si tu AuthContext lo maneja) para evitar renderizados erróneos
  const { user, loading } = useContext(AuthContext);

  // 1. Validar si el contexto de autenticación está resolviendo la sesión del usuario
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        Verificando credenciales de acceso...
      </div>
    );
  }

  // 2. Si no hay usuario autenticado (sesión inexistente)
  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        Error: Debes iniciar sesión para visualizar la tabla de posiciones.
      </div>
    );
  }

  // 3. Renderizado condicional basado estrictamente en el Rol
  if (user?.rol === ROLES.ADMINISTRADOR) {
    return <PosicionesAdmin />;
  }

  // Por defecto, si es Organizador u otro rol autorizado a ver estadísticas
  return <PosicionesOrganizador />;
}