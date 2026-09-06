import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import styles from "./TorneosAdmin.module.css"; 

const API = import.meta.env.VITE_API_URL + "/torneos";

export default function TorneosAdmin() {
  const [torneos, setTorneos] = useState([]);
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const location = useLocation();
  const navigate = useNavigate();

  const getTorneos = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setTorneos(data?.data || data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTorneos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  // Formateador visual de estados
  const formatearEstado = (estado) => {
    if (!estado) return "Sin estado";
    const est = estado.toLowerCase();
    
    if (["en juego", "iniciado", "en curso", "comenzo"].includes(est)) {
      return "Comenzo";
    }
    if (est === "inscripciones abiertas") {
      return "Inscripciones Abiertas";
    }
    if (est === "finalizado") {
      return "Finalizado";
    }

    return estado;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPaginaActual(1);

    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  };

  const handleToggleEstado = async (id) => {
    const confirmacion = window.confirm("¿Deseas desactivar este torneo?");
    if (!confirmacion) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Torneo desactivado correctamente");
        await getTorneos(); 
      } else {
        if (
          data.message?.includes("equipos inscritos") ||
          data.message?.includes("inició")
        ) {
          const forzar = window.confirm(
            `${data.message}\n\n¿Deseas forzar la desactivación de todos modos?`
          );

          if (forzar) {
            const resForce = await fetch(`${API}/${id}?force=true`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });

            const dataForce = await resForce.json();

            if (resForce.ok) {
              alert("Torneo desactivado forzadamente.");
              await getTorneos(); 
            } else {
              alert(dataForce.message || "Error al forzar la desactivación");
            }
          }
        } else {
          alert(data.message || "Error al desactivar el torneo");
        }
      }
    } catch (error) {
      console.error("Error al desactivar:", error);
      alert("Ocurrió un error en la conexión con el servidor");
    }
  };

  // Filtrado de la lista
  const filtrados = torneos.filter(
    (t) =>
      (t.nombre_torneo || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.nombre_usuario || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.apellido_usuario || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.nombre_categoria || "").toLowerCase().includes(search.toLowerCase()) || 
      (t.tipo_torneo || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.ciudad || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.fecha_inicio || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.fecha_fin || "").toLowerCase().includes(search.toLowerCase()) ||
      (formatearEstado(t.estado) || "").toLowerCase().includes(search.toLowerCase())
  );

  // Control para reajustar de página al eliminar/desactivar registros
  useEffect(() => {
    const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [filtrados.length, paginaActual, registrosPorPagina]);

  // Paginación
  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const torneosPaginados = filtrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.torneosContainer}>
      <div className={styles.tablaContainer}>
        
        <div className={styles.torneosHeader}>
          <h2 className={styles.titulo}>Gestión de Torneos (Admin)</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                type="text"
                placeholder="Buscar torneo..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        <table className={styles.tablaTorneos}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Del Torneo</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Ciudad</th>
              <th>Fecha De Inicio</th>
              <th>Fecha De Finalizacion</th>
              <th>Estado</th>
              <th colSpan="2" style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.length > 0 ? (
              torneosPaginados.map((t) => {
                const idTorneo = t.id_torneo || t.id;

                return (
                  <tr key={idTorneo}>
                    <td>{`${t.nombre_usuario || ''} ${t.apellido_usuario || ''}`}</td>
                    <td>{t.nombre_torneo}</td>
                    <td>
                      <span className={styles.badgeCategoria}>
                        {t.nombre_categoria || "Sin categoría"}
                      </span>
                    </td>
                    <td>{t.tipo_torneo}</td>
                    <td>{t.ciudad}</td>
                    <td>{t.fecha_inicio?.split("T")[0] || ""}</td>
                    <td>{t.fecha_fin?.split("T")[0] || ""}</td>
                    
                    <td>
                      <span className={styles.badgeEstado}>
                        {formatearEstado(t.estado)}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`${styles.btn} ${styles.editar}`}
                        onClick={() => navigate(`/torneos/editar/${idTorneo}`)}
                      >
                        Editar
                      </button>
                    </td>
                    <td>
                      <button
                        className={`${styles.btn} ${styles.eliminar}`}
                        onClick={() => handleToggleEstado(idTorneo)}
                      >
                        {t.activo === 1 ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    color: "rgba(255,255,255,0.4)",
                    padding: "20px 0"
                  }}
                >
                  {search ? `No hay resultados para "${search}"` : "No hay torneos disponibles"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <Pagination
          totalRegistros={filtrados.length}
          registrosPorPagina={registrosPorPagina}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
        />
      </div>
    </div>
  );
}