import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getResultados } from "../../services/resultadosService";
import Pagination from "../../components/Pagination";
import styles from "./ResultadoAdmin.module.css";

export default function ResultadoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;
  const [resultados, setResultados] = useState([]);
  const [search, setSearch] = useState("");

  const cargarResultados = async () => {
    try {
      const data = await getResultados();
      const listaResultados = data?.data || data || [];
      setResultados(listaResultados);
    } catch (error) {
      console.error("Error cargando resultados:", error);
    }
  };

  useEffect(() => {
    cargarResultados();
  }, []);

  // 🔹 Sincronizar campo de búsqueda desde los query params de la URL al montar o cambiar historial
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  // 🔹 Manejar cambio en la barra de búsqueda y actualizar URL reactivamente
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPaginaActual(1); // Resetea a la primera página cuando se busca

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

  // 🔹 Filtrado reactivo en memoria local (aplica sobre IDs, nombres de equipos y el texto del encuentro)
  const filtrados = resultados.filter((r) => {
    const texto = search.toLowerCase();
    return (
      (r.id_resultado || "").toString().includes(texto) ||
      (r.id_encuentro || "").toString().includes(texto) ||
      (r.equipo_local || "").toLowerCase().includes(texto) ||
      (r.equipo_visitante || "").toLowerCase().includes(texto)
    );
  });

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  // Secciona sobre los registros filtrados
  const resultadosPaginados = filtrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.container}>
      <div className={styles.tablaContainer}>
        
        {/* Encabezado estandarizado */}
        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Gestión de Resultados (Admin)</h2>

          <div className={styles.accionesSuperiores}>
            {/* Caja Buscar Interna Estandarizada */}
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                type="text"
                placeholder="Buscar resultado..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            <button
              className={styles.btnCrear}
              onClick={() => navigate("/resultados/Crear")}
            >
              Crear Resultado
            </button>
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Encuentro</th>
                <th>Equipos</th>
                <th>Goles Local</th>
                <th>Goles Visitante</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {resultadosPaginados.length > 0 ? (
                resultadosPaginados.map((r) => (
                  <tr key={r.id_resultado}>
                    <td>{r.id_resultado}</td>
                    <td>{r.id_encuentro || `Encuentro #${r.id_encuentro}`}</td>
                    <td>
                      <strong>{r.equipo_local}</strong> vs {r.equipo_visitante}
                    </td>
                    <td>
                      <span className={styles.marcador}>{r.goles_local}</span>
                    </td>
                    <td>
                      <span className={styles.marcador}>{r.goles_visitante}</span>
                    </td>
                    <td>
                      <div className={styles.accionesGroup}>
                        <button
                          className={`${styles.btnAction} ${styles.btnEditar}`}
                          onClick={() => navigate(`/resultados/Editar/${r.id_resultado}`)}
                        >
                          Editar
                        </button>
                        <button
                          className={`${styles.btnAction} ${styles.btnEliminar}`}
                          onClick={() => navigate(`/resultados/Eliminar/${r.id_resultado}`)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noDataText} style={{ textAlign: "center", fontStyle: "italic", color: "rgba(255,255,255,0.4)", padding: "24px" }}>
                    {search ? `No se encontraron resultados para "${search}"` : "No hay resultados registrados en el sistema."}
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