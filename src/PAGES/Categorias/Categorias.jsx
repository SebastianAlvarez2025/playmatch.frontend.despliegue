import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

import CategoriasAdmin from "./CategoriasAdmin";

export default function Categorias() {
  const { user } = useContext(AuthContext);

  // Función interna para renderizar según el rol
  const renderContenidoPorRol = () => {
    if (user?.rol === ROLES.ADMINISTRADOR) {
      return <CategoriasAdmin />;
    }
    
    return (
      <p style={{ color: "#ef4444", textAlign: "center", padding: "20px", fontWeight: "600" }}>
        Acceso no autorizado. Este módulo es exclusivo para Administradores.
      </p>
    );
  };

  // Envolvemos el resultado en un contenedor con scroll asegurado
  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      minHeight: "100vh", 
      overflowY: "auto" 
    }}>
      {renderContenidoPorRol()}
    </div>
  );
}