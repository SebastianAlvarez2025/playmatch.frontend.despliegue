import { useContext, useEffect, useState } from "react"; 
import { AuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Usuarios.module.css";
import Pagination from "../../components/Pagination";

const API = import.meta.env.VITE_API_URL + "/usuarios";

export default function Usuarios() {
  const { user } = useContext(AuthContext);
  const rolActual = Number(user?.rol);
  const idUsuarioActual = Number(user?.id_usuario);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const location = useLocation();
  const navigate = useNavigate();

  const getUsuarios = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsuarios(data?.data || []);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  const tienePermisos = (usuario) => {
    const rolObjetivo = Number(usuario.id_rol);
    const idObjetivo = Number(usuario.id);

    // Superadministrador
    if (rolActual === 11) {
      // No puede desactivarse a sí mismo
      return idUsuarioActual !== idObjetivo;
    }

    // Administrador
    if (rolActual === 1) {
      return rolObjetivo !== 1 && rolObjetivo !== 11;
    }

    return false;
  };


  useEffect(() => {
    getUsuarios();
  }, []);

  // SEARCH - Sincronizar desde la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPaginaActual(1); // Resetea a la primera página cuando busques

    const params = new URLSearchParams(location.search);
    if (value.trim()) params.set("search", value);
    else params.delete("search");

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true },
    );
  };

  const filtrados = usuarios.filter(
    (u) =>
      (u.nombre_rol || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.nombre_usuario || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.apellido_usuario || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.telefono || "").toLowerCase().includes(search.toLowerCase()),
  );

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const usuariosPaginados = filtrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.usuariosContainer}>
      <div className={styles.tablaContainer}>
        
        {/* Encabezado del Módulo con Barra Estandarizada */}
        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Gestión de Usuarios</h2>
          
          <div className={styles.accionesSuperiores}>
            {/* Caja Buscar Interna Estandarizada */}
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, rol, email..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            {rolActual === 11 && (
            <button
              className={styles.btnCrear}
              onClick={() => navigate("/usuarios/crear")}
            >
              Crear administrador
            </button>
            )}
            
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.tablaUsuarios}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Rol</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha De Nacimiento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosPaginados.length > 0 ? (
                usuariosPaginados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre_rol}</td>
                    <td>{u.nombre_usuario}</td>
                    <td>{u.apellido_usuario}</td>
                    <td>{u.fecha_nacimiento?.split("T")[0] || "N/A"}</td>
                    <td>{u.telefono || "N/A"}</td>
                    <td>{u.email}</td>
                    <td>
                      <div className={styles.accionesGroup}>
                        {tienePermisos(u) && (
                          <button
                            className={`${styles.btnAction} ${styles.btnEditar}`}
                            onClick={() => navigate(`/usuarios/editar/${u.id}`)}
                          >
                            Editar
                          </button>
                        )}

                        {tienePermisos(u) && (
                          <button
                            className={`${styles.btnAction} ${styles.btnEliminar}`}
                            onClick={() => navigate(`/usuarios/eliminar/${u.id}`)}
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noDataText} style={{ textAlign: "center", fontStyle: "italic", color: "rgba(255,255,255,0.4)", padding: "24px" }}>
                    {search ? `No se encontraron usuarios para "${search}"` : "No hay usuarios registrados en el sistema."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Condicional */}
        {filtrados.length > 0 && (
          <Pagination
            totalRegistros={filtrados.length}
            registrosPorPagina={registrosPorPagina}
            paginaActual={paginaActual}
            setPaginaActual={setPaginaActual}
          />
        )}
      </div>
    </div>
  );
}