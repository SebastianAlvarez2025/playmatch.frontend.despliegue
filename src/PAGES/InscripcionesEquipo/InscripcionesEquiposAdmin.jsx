// ===================================================================
// InscripcionesEquiposAdmin.jsx
// Vista de supervisión general para el Administrador (RF-006).
//
// El Administrador puede consultar todas las inscripciones de todos
// los torneos y equipos.
//
// Aprobar / cancelar inscripciones es responsabilidad exclusiva
// del Organizador.
// ===================================================================

import { useEffect, useState } from "react";

import { getInscripciones } from "../../services/inscripcionesEquipoService.js";

import Pagination from "../../components/Pagination";

import styles from "./InscripcionesEquiposAdmin.module.css";

export default function InscripcionesEquiposAdmin() {
  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [inscripciones, setInscripciones] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);

  const registrosPorPagina = 7;

  // ==========================================================
  // FORMATEAR FECHA
  // ==========================================================

  const formatFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return "";
    }

    return fechaFormateada.toLocaleString("es-CO");
  };

  // ==========================================================
  // CARGAR INSCRIPCIONES
  // ==========================================================

  const cargarInscripciones = async () => {
    try {
      setCargando(true);
      setError("");

      // ========================================================
      // IMPORTANTE:
      // getInscripciones() utiliza:
      //
      // GET /api/inscripciones
      //
      // NO /api/inscripcionEquipos
      // ========================================================

      const data = await getInscripciones();

      if (Array.isArray(data)) {
        setInscripciones(data);
      } else {
        setInscripciones([]);
      }
    } catch (err) {
      console.error("Error al obtener inscripciones:", err);

      const mensaje =
        err.response?.data?.message || "Error al conectar con el servidor.";

      setError(mensaje);

      setInscripciones([]);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================
  // CARGAR CUANDO SE ABRE LA PÁGINA
  // ==========================================================

  useEffect(() => {
    cargarInscripciones();
  }, []);

  // ==========================================================
  // FILTRAR INSCRIPCIONES
  // ==========================================================

  const inscripcionesFiltradas = inscripciones.filter((inscripcion) => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return true;
    }

    const torneo = inscripcion.nombre_torneo?.toLowerCase() || "";

    const equipo = inscripcion.nombre_equipo?.toLowerCase() || "";

    const estado = inscripcion.estado?.toLowerCase() || "";

    return (
      torneo.includes(texto) || equipo.includes(texto) || estado.includes(texto)
    );
  });

  // ==========================================================
  // PAGINACIÓN
  // ==========================================================

  const ultimoRegistro = paginaActual * registrosPorPagina;

  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const inscripcionesPaginadas = inscripcionesFiltradas.slice(
    primerRegistro,
    ultimoRegistro,
  );

  // ==========================================================
  // SI EL FILTRO CAMBIA LA CANTIDAD DE PÁGINAS
  // ==========================================================

  useEffect(() => {
    const totalPaginas = Math.ceil(
      inscripcionesFiltradas.length / registrosPorPagina,
    );

    if (totalPaginas > 0 && paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }

    if (totalPaginas === 0 && paginaActual !== 1) {
      setPaginaActual(1);
    }
  }, [inscripcionesFiltradas.length, paginaActual]);

  // ==========================================================
  // CLASE DEL ESTADO
  // ==========================================================

  const claseBadge = (estado) => {
    switch (estado) {
      case "Inscrito":
        return styles.badgeInscrito;

      case "Pendiente":
        return styles.badgePendiente;

      case "Cancelado":
        return styles.badgeCancelado;

      default:
        return styles.badgeDefault;
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* ====================================================
            ENCABEZADO
        ===================================================== */}

        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Inscripciones (Admin)</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <input
                type="text"
                placeholder="Buscar torneo, equipo o estado..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
              />

              <span className={styles.iconoLupa}>🔍</span>
            </div>
          </div>
        </div>

        {/* ====================================================
            CARGANDO
        ===================================================== */}

        {cargando && (
          <p className={styles.mensajeVacio}>Cargando inscripciones...</p>
        )}

        {/* ====================================================
            ERROR
        ===================================================== */}

        {!cargando && error && <p className={styles.errorText}>{error}</p>}

        {/* ====================================================
            TABLA
        ===================================================== */}

        {!cargando && !error && (
          <>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Torneo</th>
                  <th>Equipo</th>
                  <th>Fecha Inscripción</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {inscripcionesPaginadas.length > 0 ? (
                  inscripcionesPaginadas.map((inscripcion) => (
                    <tr key={inscripcion.id_inscripcion_e}>
                      {/* ID */}

                      <td>{inscripcion.id_inscripcion_e}</td>

                      {/* TORNEO */}

                      <td>{inscripcion.nombre_torneo}</td>

                      {/* EQUIPO */}

                      <td>{inscripcion.nombre_equipo}</td>

                      {/* FECHA */}

                      <td>{formatFecha(inscripcion.fecha_ins_equipo)}</td>

                      {/* ESTADO */}

                      <td>
                        <span
                          className={`${styles.badge} ${claseBadge(
                            inscripcion.estado,
                          )}`}
                        >
                          {inscripcion.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.mensajeVacio}>
                      {busqueda
                        ? "No se encontraron inscripciones con ese criterio."
                        : "No hay inscripciones registradas."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ==================================================
                PAGINACIÓN
            =================================================== */}

            {inscripcionesFiltradas.length > 0 && (
              <Pagination
                totalRegistros={inscripcionesFiltradas.length}
                registrosPorPagina={registrosPorPagina}
                paginaActual={paginaActual}
                setPaginaActual={setPaginaActual}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
