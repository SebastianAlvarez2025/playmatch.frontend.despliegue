import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/estilosComponents/navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  const inicialUsuario = user?.nombre_usuario 
    ? user.nombre_usuario.charAt(0).toUpperCase() 
    : "U";

  useEffect(() => {
    function manejarClicFuera(evento) {
      if (dropdownRef.current && !dropdownRef.current.contains(evento.target)) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  const handleLogout = () => {
    setDropdownAbierto(false);
    logout();
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div className="logoName">
        <Link to="/home" className="logo-link">
          <div className="titulo-logo">
            <span className="play">⚽ PLAYMATCH</span>
          </div>
        </Link>
      </div>

      {/* BLOQUE DERECHO */}
      <div className="block-2">
        <div className="navbar-actions">
          {!isAuthenticated ? (
            <div className="action-btn">
              <Link to="/registro" className="navbar-registrar">
                Registrar
              </Link>
              <Link to="/login" className="navbar-login">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <div className="perfil-desplegable-container" ref={dropdownRef}>
              
              {/* Avatar circular estilo neón */}
              <div 
                className="avatar-inicial" 
                onClick={() => setDropdownAbierto(!dropdownAbierto)}
              >
                {inicialUsuario}
              </div>

              {/* Menú desplegable */}
              {dropdownAbierto && (
                <div className="menu-desplegable">
                  <div className="info-usuario-desplegable">
                    <p className="usuario-nombre-completo">
                      {user.nombre_usuario} {user.apellido_usuario}
                    </p>
                    <span className="usuario-id-tag">Identificación: {user.id_usuario}</span>
                  </div>
                  
                  <hr className="divisor-menu" />
                  
                  <Link to="/perfil" className="opcion-menu" onClick={() => setDropdownAbierto(false)}>
                    👤 Mi Perfil
                  </Link>
                  <Link to="/perfil/cambio-contraseña-perfil" className="opcion-menu" onClick={() => setDropdownAbierto(false)}>
                    🗝️ Contraseña
                  </Link>
                  
                  <button className="opcion-menu cerrar-sesion" onClick={handleLogout}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}