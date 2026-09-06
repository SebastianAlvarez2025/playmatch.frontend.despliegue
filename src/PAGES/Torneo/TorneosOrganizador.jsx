import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Pagination from "../../components/Pagination";
import TorneoCard from "./torneoCard"; 
import styles from "./TorneosOrganizador.module.css"; 

const API = import.meta.env.VITE_API_URL + "/torneos";

export default function TorneosOrganizador() {
  const [torneos, setTorneos] = useState([]);
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;

  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const getMisTorneos = async () => {
    try {
      const authToken = token || localStorage.getItem("token");
      const response = await fetch(`${API}/usuario/mios`, {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
      });
      
      const data = await response.json();
      setTorneos(data?.data || data || []);
    } catch (error) {
      console.error("Error al cargar mis torneos:", error);
    }
  };

  useEffect(() => {
    getMisTorneos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

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

  // Función unificada para eliminar/desactivar el torneo desde la tarjeta
  const handleToggleEstado = async (id) => {
    const confirmacion = window.confirm(
      "¿Seguro que deseas desactivar este torneo? Los encuentros y estadísticas asociados podrían dejar de estar visibles."
    );
    if (!confirmacion) return;

    const authToken = token || localStorage.getItem("token");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Torneo desactivado correctamente 🏁");
        await getMisTorneos();
      } else {
        const mensajeError = data?.message || "";
        
        if (
          mensajeError.includes("equipos inscritos") ||
          mensajeError.includes("inició") ||
          mensajeError.includes("activos")
        ) {
          const forzar = window.confirm(
            `${mensajeError}\n\n¿Deseas forzar la desactivación de todos modos?`
          );

          if (forzar) {
            const resForce = await fetch(`${API}/${id}?force=true`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
              },
            });

            const dataForce = await resForce.json();

            if (resForce.ok) {
              alert(dataForce.message || "Torneo desactivado forzadamente.");
              await getMisTorneos();
            } else {
              alert(dataForce.message || "Error al forzar la desactivación");
            }
          }
        } else {
          alert(mensajeError || "Error al desactivar el torneo");
        }
      }
    } catch (error) {
      console.error("Error al desactivar:", error);
      alert("Error de conexión con el servidor");
    }
  };

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
      (t.estado || "").toLowerCase().includes(search.toLowerCase())
  );

  // Reajustar la página si se elimina el último elemento de una página
  useEffect(() => {
    const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [filtrados.length, paginaActual, registrosPorPagina]);

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const torneosPaginados = filtrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.torneosContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.torneosHeader}>
          <h2 className={styles.titulo}>Mis torneos organizados</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                id="buscar_torneo"
                type="text"
                placeholder="Buscar torneo..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <button
              className={`${styles.btn} ${styles.crear}`}
              onClick={() => navigate("/torneos/crear")}
            >
              Crear
            </button>
          </div>
        </div>

        {/* Sección de Cards pasando la prop onEliminar */}
        <div className={styles.cardsGrid}>
          {filtrados.length > 0 ? (
            torneosPaginados.map((torneo) => {
              const idTorneo = torneo.id_torneo || torneo.id;
              return (
                <TorneoCard
                  key={idTorneo}
                  torneo={torneo}
                  onEliminar={() => handleToggleEstado(idTorneo)}
                />
              );
            })
          ) : (
            <div className={styles.noResultados}>
              <p>
                {search
                  ? `No hay resultados para "${search}"`
                  : "Aún no has creado ningún torneo"}
              </p>
            </div>
          )}
        </div>

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