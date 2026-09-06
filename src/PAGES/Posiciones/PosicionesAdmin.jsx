import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTablaPosiciones } from "../../services/posicionesService";
import Pagination from "../../components/Pagination";
import styles from "./PosicionesAdmin.module.css";

export default function Posiciones() {
  const navigate = useNavigate();
  const location = useLocation();
  const [posiciones, setPosiciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [search, setSearch] = useState("");
  const registrosPorPagina = 5;
  
  // ID estático para pruebas de desarrollo de Play Match
  const id_torneo = 2;

  // ======================================================
  // CARGAR POSICIONES (Optimizado con useCallback)
  // ======================================================
  const cargarPosiciones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTablaPosiciones(id_torneo);
      setPosiciones(res.data || []);
    } catch (error) {
      console.error("Error al cargar la tabla de posiciones:", error);
    } finally {
      setLoading(false);
    }
  }, [id_torneo]);

  useEffect(() => {
    cargarPosiciones();
  }, [cargarPosiciones]);

  // 🔹 Sincronizar campo de búsqueda desde los query params de la URL
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

  // 🔹 Filtrado reactivo en memoria local (aplica sobre el nombre del equipo)
  const filtrados = posiciones.filter((e) => {
    const texto = search.toLowerCase();
    return (e.nombre_equipo || "").toLowerCase().includes(texto);
  });

  // Cálculos de rangos para la paginación local usando los datos filtrados
  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const posicionesPaginadas = filtrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.container}>
      <div className={styles.tablaWrapper}>
        
        {/* Encabezado semántico de la vista */}
        <div className={styles.headerTabla}>
          <div>
            <h2 className={styles.titulo}>Tabla de Posiciones</h2>
            {posiciones.length > 0 && (
              <h3 className={styles.subtitulo}>{posiciones[0]?.nombre_torneo}</h3>
            )}
          </div>

          <div className={styles.accionesSuperiores}>
            {/* Caja Buscar Interna Estandarizada */}
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                type="text"
                placeholder="Buscar equipo..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            <button 
              className={styles.btnActualizar} 
              onClick={cargarPosiciones}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Actualizar Datos"}
            </button>
          </div>
        </div>

        {/* Tabla Deportiva Estructurada */}
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.puesto}>#</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th>PTS</th>
            </tr>
          </thead>

          <tbody>
            {posicionesPaginadas.length > 0 ? (
              posicionesPaginadas.map((e, index) => {
                // Cálculo matemático del puesto real basado en el desplazamiento de la página
                const puestoReal = primerRegistro + index + 1;
                const esLider = puestoReal === 1;

                return (
                  <tr 
                    key={e.id_equipo} 
                    className={esLider ? styles.filaLider : ""}
                  >
                    <td className={styles.puesto}>{puestoReal}</td>
                    <td className={styles.equipo}>{e.nombre_equipo}</td>
                    <td>{e.partidos_jugados}</td>
                    <td>{e.ganados}</td>
                    <td>{e.empatados}</td>
                    <td>{e.perdidos}</td>
                    <td>{e.goles_favor}</td>
                    <td>{e.goles_contra}</td>
                    <td>{e.diferencia_gol}</td>
                    <td className={styles.puntos}>{e.puntos}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className={styles.cargandoText} style={{ textAlign: "center", fontStyle: "italic", color: "rgba(255,255,255,0.4)", padding: "24px" }}>
                  {loading 
                    ? "Calculando estadísticas del torneo..." 
                    : search 
                      ? `No se encontraron resultados para "${search}"` 
                      : "No se encontraron registros de posiciones."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Componente Reutilizable de Paginación Condicional */}
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