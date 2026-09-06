// Este componente se muestra cuando un usuario logueado
// intenta entrar a una vista para la cual su rol NO tiene permiso.
// Por ejemplo: un Jugador tratando de entrar a /usuarios (solo Administrador).

import { useNavigate } from "react-router-dom";

export default function NoAutorizado() {
  // Hook de react-router para poder redirigir al usuario con un botón
  const navigate = useNavigate();

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>🚫 Acceso no autorizado</h1>
      <p style={estilos.mensaje}>
        No tienes permisos para ver esta página. Si crees que esto es un
        error, contacta al administrador del sistema.
      </p>
      <button style={estilos.boton} onClick={() => navigate("/home")}>
        Volver al inicio
      </button>
    </div>
  );
}

// Estilos simples en línea, solo para que se vea presentable
const estilos = {
  contenedor: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    padding: "20px",
  },
  titulo: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  mensaje: {
    fontSize: "16px",
    maxWidth: "400px",
    marginBottom: "20px",
  },
  boton: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#366091",
    color: "white",
    cursor: "pointer",
  },
};