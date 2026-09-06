import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEncuentrosByTorneo } from "../../services/encuentrosService";
import { getTorneoById } from "../../services/torneoService";
import { ROLES } from "../../constants/roles";
import styles from "./EncuentrosList.module.css";

export default function EncuentrosList() {
  const { id_torneo } = useParams();
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [nombreTorneo, setNombreTorneo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros y Paginación
  const [busqueda, setBusqueda] = useState("");
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 6;

  // Obtener usuario en sesión
  const userStored =
    localStorage.getItem("user") || localStorage.getItem("usuario");
  const usuarioActual = userStored ? JSON.parse(userStored) : null;
  const idOrganizadorActual = usuarioActual?.id_usuario || usuarioActual?.id;

  // Extraer el rol numérico de manera segura
  const rolId = Number(usuarioActual?.id_rol ?? usuarioActual?.rol);

  // Verificar si el usuario tiene rol de gestión (ADMINISTRADOR u ORGANIZADOR)
  const esGestion =
    rolId === ROLES.ADMINISTRADOR || rolId === ROLES.ORGANIZADOR;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        let listaBruta = [];

        if (id_torneo) {
          const [dataEncuentros, dataTorneo] = await Promise.all([
            getEncuentrosByTorneo(id_torneo),
            getTorneoById(id_torneo).catch(() => null),
          ]);

          listaBruta = dataEncuentros?.data || dataEncuentros || [];
          const nombre = dataTorneo?.nombre || dataTorneo?.data?.nombre;
          setNombreTorneo(nombre ? nombre : "");
        } else {
          const dataGlobal = await getAllEncuentrosOrganizador();
          listaBruta = dataGlobal?.data || dataGlobal || [];
          setNombreTorneo("Todos los Encuentros");
        }

        // Filtrado por creador/organizador si aplica
        const listaFiltrada = listaBruta.filter((item) => {
          if (!idOrganizadorActual || !esGestion) return true;
          const creadorItem =
            item.id_organizador ||
            item.id_usuario_creador ||
            item.id_usuario ||
            item.id_creador;
          return (
            !creadorItem || Number(creadorItem) === Number(idOrganizadorActual)
          );
        });

        setEncuentros(listaFiltrada);
      } catch (err) {
        console.error("Error al cargar la lista de encuentros:", err);
        setError("Ocurrió un error al cargar la lista de partidos.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id_torneo, idOrganizadorActual, esGestion]);

  // Extraer las jornadas únicas disponibles para el selector
  const jornadasDisponibles = useMemo(() => {
    const jornadas = encuentros
      .map((item) => item.jornada)
      .filter(
        (jornada) =>
          jornada !== undefined && jornada !== null && jornada !== "",
      );
    return [...new Set(jornadas)].sort((a, b) => Number(a) - Number(b));
  }, [encuentros]);

  // Filtrado local por término de búsqueda (Equipos, Lugar o Jornada) y selector de Jornada
  const encuentrosFiltrados = useMemo(() => {
    return encuentros.filter((item) => {
      const local = (
        item.equipo_local ||
        item.nombre_local ||
        ""
      ).toLowerCase();
      const visitante = (
        item.equipo_visitante ||
        item.nombre_visitante ||
        ""
      ).toLowerCase();
      const lugar = (item.lugar || "").toLowerCase();
      const jornadaStr = item.jornada ? String(item.jornada).toLowerCase() : "";
      const termino = busqueda.toLowerCase().trim();

      // Coincidencia con la búsqueda por texto
      const coincideBusqueda =
        local.includes(termino) ||
        visitante.includes(termino) ||
        lugar.includes(termino) ||
        jornadaStr.includes(termino) ||
        `jornada ${jornadaStr}`.includes(termino);

      // Coincidencia con el select de jornada
      const coincideJornada =
        !jornadaSeleccionada ||
        String(item.jornada) === String(jornadaSeleccionada);

      return coincideBusqueda && coincideJornada;
    });
  }, [encuentros, busqueda, jornadaSeleccionada]);

  // Lógica de Paginación
  const totalPaginas =
    Math.ceil(encuentrosFiltrados.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const encuentrosPaginados = encuentrosFiltrados.slice(
    indiceInicio,
    indiceInicio + elementosPorPagina,
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Por definir";
    return fechaStr.split("T")[0];
  };

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando encuentros...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* CABECERA */}
      <div className={styles.header}>
        <h2 className={styles.titulo}>
          Encuentros{" "}
          {nombreTorneo && (
            <span className={styles.subtitulo}>- {nombreTorneo}</span>
          )}
        </h2>

        {id_torneo && esGestion && (
          <div className={styles.headerButtons}>
            <button
              className={styles.btnFixture}
              onClick={() => navigate(`/fixture/generar/${id_torneo}`)}
            >
              Generar Fixture
            </button>
            <button
              className={styles.btnCrear}
              onClick={() => navigate(`/encuentros/crear/${id_torneo}`)}
            >
              + Crear Partido
            </button>
          </div>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA / FILTROS */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por equipo, lugar o jornada..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          className={styles.inputBusqueda}
        />

        <select
          value={jornadaSeleccionada}
          onChange={(e) => {
            setJornadaSeleccionada(e.target.value);
            setPaginaActual(1);
          }}
          className={styles.selectJornada}
        >
          <option value="">Todas las jornadas</option>
          {jornadasDisponibles.map((j) => (
            <option key={j} value={j}>
              Jornada {j}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {/* TABLA / EMPTY STATE */}
      {encuentrosPaginados.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>⚽</div>
          <h3>No hay encuentros registrados</h3>
          <p>
            {busqueda || jornadaSeleccionada
              ? "No se encontraron partidos que coincidan con la búsqueda."
              : id_torneo
                ? "Este torneo aún no tiene partidos programados."
                : "No tienes partidos registrados en tus torneos."}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>LOCAL</th>
                  <th>VISITANTE</th>
                  <th>JORNADA</th>
                  <th>LUGAR</th>
                  <th>FECHA</th>
                  <th>HORA</th>
                  <th>ESTADO</th>
                  {esGestion && <th>ACCIONES</th>}
                </tr>
              </thead>
              <tbody>
                {encuentrosPaginados.map((item) => {
                  const estadoClass = item.estado
                    ? item.estado.toLowerCase().replace(/\s+/g, "")
                    : "programado";

                  return (
                    <tr key={item.id_encuentro}>
                      <td className={styles.equipoCell}>
                        {item.equipo_local || item.nombre_local || "Local"}
                      </td>
                      <td className={styles.equipoCell}>
                        {item.equipo_visitante ||
                          item.nombre_visitante ||
                          "Visitante"}
                      </td>
                      <td>Jornada {item.jornada || "-"}</td>
                      <td>{item.lugar || "Por definir"}</td>
                      <td>{formatearFecha(item.fecha)}</td>
                      <td>{item.hora || "--:--"}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${styles[estadoClass]}`}
                        >
                          {item.estado || "Programado"}
                        </span>
                      </td>
                      {esGestion && (
                        <td className={styles.accionesCell}>
                          <button
                            className={styles.btnEditar}
                            onClick={() =>
                              navigate(
                                `/encuentros/reprogramar/${item.id_encuentro}`,
                              )
                            }
                          >
                            Editar
                          </button>
                          <button
                            className={styles.btnEliminar}
                            onClick={() =>
                              navigate(
                                `/encuentros/eliminar/${item.id_encuentro}`,
                              )
                            }
                          >
                            Desactivar
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div className={styles.paginacionContainer}>
            <span className={styles.paginacionInfo}>
              Página {paginaActual} de {totalPaginas} (
              {encuentrosFiltrados.length} resultados)
            </span>
            <div className={styles.paginacionBotones}>
              <button
                className={styles.btnPagina}
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <button
                className={styles.btnPagina}
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
