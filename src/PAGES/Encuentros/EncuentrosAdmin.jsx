import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  getEncuentros,
  generarFixtureAutomatico,
} from "../../services/encuentrosService";
import styles from "./EncuentrosAdmin.module.css";

export default function EncuentrosAdmin() {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const [encuentros, setEncuentros] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🔹 Estado local para el buscador independiente de encuentros
  const [search, setSearch] = useState("");

  // 🔹 Memorización de la consulta asíncrona básica
  const cargarEncuentros = useCallback(async () => {
    try {
      const data = await getEncuentros();
      setEncuentros(data || []);
    } catch (error) {
      console.error("Error al obtener encuentros globales:", error);
    }
  }, []);

  useEffect(() => {
    cargarEncuentros();
  }, [cargarEncuentros]);

  const handleGenerarFixture = async () => {
    const confirmar = window.confirm("¿Deseas generar el fixture automático de prueba para el Torneo #1?");
    if (!confirmar) return;

    try {
      setLoading(true);

      // Datos mockeados estructurales para la petición
      const datos = {
        id_torneo: 1,
        equipos: [1, 2, 3, 4, 5, 6],
      };

      const res = await generarFixtureAutomatico(datos);
      alert(res?.message || "Fixture generado exitosamente");
      cargarEncuentros();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Ocurrió un error al procesar el fixture automático");
    } finally {
      setLoading(false);
    }
  };

  // Cambios en el input del buscador
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPaginaActual(1); // Mantiene al usuario en la página 1 al filtrar
  };

  // 🔹 Filtrado dinámico multivariable
  const encuentrosFiltrados = encuentros.filter((e) => {
    const termino = search.toLowerCase();
    const nombreTorneoCompuesto = e.nombre_torneo || `torneo ${e.id_torneo}`;
    return (
      nombreTorneoCompuesto.toLowerCase().includes(termino) ||
      (e.equipo_local || "").toLowerCase().includes(termino) ||
      (e.equipo_visitante || "").toLowerCase().includes(termino) ||
      (e.lugar || "").toLowerCase().includes(termino) ||
      (e.jornada || "").toString().includes(termino) ||
      (e.estado || "").toLowerCase().includes(termino) ||
      (e.id_encuentro || "").toString().includes(termino)
    );
  });

  // 🔹 Formateador defensivo seguro contra strings nulos o vacíos
  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return "Por definir";
    try {
      return fechaRaw.split("T")[0].split("-").reverse().join("-");
    } catch (err) {
      return fechaRaw;
    }
  };

  // Lógica interna de paginación basada en los datos filtrados
  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const encuentrosPaginados = encuentrosFiltrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.container}>
      <div className={styles.tablaCard}>
        
        {/* ENCABEZADO Y CONTROLES */}
        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Encuentros (Administrador)</h2>

          <div className={styles.accionesHeader}>
            {/* Buscador de la tabla */}
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                type="text"
                placeholder="Buscar partido..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <button
              className={`${styles.btn} ${styles.btnFixture}`}
              onClick={handleGenerarFixture}
              disabled={loading}
            >
              {loading ? "Generando..." : "Generar Fixture"}
            </button>

            <button
              className={`${styles.btn} ${styles.btnCrear}`}
              onClick={() => navigate("/encuentros/crear")}
            >
              + Crear Partido
            </button>
          </div>
        </div>

        {/* ESTRUCTURA DE DATOS */}
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Torneo</th>
              <th>Local</th>
              <th>Visitante</th>
              <th>Jornada</th>
              <th>Lugar</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {encuentrosPaginados.length > 0 ? (
              encuentrosPaginados.map((e) => (
                <tr key={e.id_encuentro}>
                  <td><strong>#{e.id_encuentro}</strong></td>
                  <td>{e.nombre_torneo || `Torneo ${e.id_torneo}`}</td>
                  <td>{e.equipo_local}</td>
                  <td>{e.equipo_visitante}</td>
                  <td>Jornada {e.jornada}</td>
                  <td>{e.lugar || "Sin asignar"}</td>
                  <td>{formatearFecha(e.fecha)}</td>
                  <td>{e.hora || "--:--"}</td>
                  <td>
                    <span 
                      className={`${styles.badgeEstado} ${
                        e.estado?.toLowerCase() === "finalizado" 
                          ? styles.estadoFinalizado 
                          : styles.estadoPendiente
                      }`}
                    >
                      {e.estado || "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.contenedorAccionesCelda}>
                      <button
                        className={`${styles.btn} ${styles.btnEditar}`}
                        onClick={() => navigate(`/encuentros/editar/${e.id_encuentro}`)}
                      >
                        Editar
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnEliminar}`}
                        onClick={() => navigate(`/encuentros/eliminar/${e.id_encuentro}`)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className={styles.sinDatos}>
                  {search ? `No se encontraron partidos para "${search}"` : "No hay encuentros registrados en el sistema."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        {encuentrosFiltrados.length > 0 && (
          <Pagination
            totalRegistros={encuentrosFiltrados.length}
            registrosPorPagina={registrosPorPagina}
            paginaActual={paginaActual}
            setPaginaActual={setPaginaActual}
          />
        )}
      </div>
    </div>
  );
}