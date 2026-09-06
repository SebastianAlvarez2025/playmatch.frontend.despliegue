// ===================================================================
// INSCRIPCIONES DE EQUIPOS - VISTA DEL DIRECTOR TÉCNICO
//
// El entrenador puede:
// 1. Ver sus equipos.
// 2. Ver todos los torneos disponibles.
// 3. Ver si cada equipo ya está inscrito en un torneo.
// 4. Inscribir un equipo en un torneo donde todavía no esté inscrito.
//
// RF-006.2
// ===================================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMisEquipos } from "../../services/equiposService.js";
import { getInscripcionesPorEquipo } from "../../services/inscripcionesEquipoService.js";

import { getTorneos } from "../../services/torneoService.js";

import "../../styles/estilosPages/inscripcionEquipo/misInscripciones.css";

export default function InscripcionesEquiposEntrenador() {
  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);

  const [inscripciones, setInscripciones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // CARGAR INFORMACIÓN
  // ==========================================================

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        // ======================================================
        // 1. OBTENER LOS EQUIPOS DEL ENTRENADOR
        // ======================================================

        const respuestaEquipos = await getMisEquipos();

        let misEquipos = [];

        if (Array.isArray(respuestaEquipos)) {
          misEquipos = respuestaEquipos;
        } else if (Array.isArray(respuestaEquipos?.data)) {
          misEquipos = respuestaEquipos.data;
        } else if (respuestaEquipos?.data) {
          misEquipos = [respuestaEquipos.data];
        }

        // ======================================================
        // 2. OBTENER TODOS LOS TORNEOS
        // ======================================================

        const respuestaTorneos = await getTorneos();

        let todosLosTorneos = [];

        if (Array.isArray(respuestaTorneos)) {
          todosLosTorneos = respuestaTorneos;
        } else if (Array.isArray(respuestaTorneos?.data)) {
          todosLosTorneos = respuestaTorneos.data;
        } else if (respuestaTorneos?.data) {
          todosLosTorneos = [respuestaTorneos.data];
        }

        // ======================================================
        // 3. OBTENER LAS INSCRIPCIONES DE CADA EQUIPO
        // ======================================================

        const todasLasInscripciones = [];

        for (const equipo of misEquipos) {
          try {
            const idEquipo = equipo.id_equipo;

            const respuestaInscripciones =
              await getInscripcionesPorEquipo(idEquipo);

            console.log(
              `Inscripciones del equipo ${idEquipo}:`,
              respuestaInscripciones,
            );

            let inscripcionesEquipo = [];

            if (Array.isArray(respuestaInscripciones)) {
              inscripcionesEquipo = respuestaInscripciones;
            } else if (Array.isArray(respuestaInscripciones?.data)) {
              inscripcionesEquipo = respuestaInscripciones.data;
            } else if (respuestaInscripciones?.data) {
              inscripcionesEquipo = [respuestaInscripciones.data];
            }

            // Guardamos cada inscripción junto con el equipo
            inscripcionesEquipo.forEach((inscripcion) => {
              todasLasInscripciones.push({
                ...inscripcion,
                id_equipo: idEquipo,
              });
            });
          } catch (errorEquipo) {
            console.error(
              `Error obteniendo inscripciones del equipo ${equipo.id_equipo}:`,
              errorEquipo,
            );
          }
        }

        if (activo) {
          setEquipos(misEquipos);
          setTorneos(todosLosTorneos);
          setInscripciones(todasLasInscripciones);
        }
      } catch (err) {
        console.error("ERROR CARGANDO INSCRIPCIONES DEL ENTRENADOR:", err);

        if (activo) {
          setError(
            err?.response?.data?.message || "No se pudieron cargar los datos.",
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // ==========================================================
  // FORMATEAR FECHA
  // ==========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "—";
    }

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return "—";
    }

    return fechaFormateada.toLocaleDateString("es-CO");
  };

  // ==========================================================
  // OBTENER ID DE TORNEO
  // ==========================================================

  const obtenerIdTorneo = (torneo) => {
    return torneo.id_torneo ?? torneo.idTorneo ?? torneo.id;
  };

  // ==========================================================
  // OBTENER NOMBRE DEL TORNEO
  // ==========================================================

  const obtenerNombreTorneo = (torneo) => {
    return (
      torneo.nombre_torneo ??
      torneo.nombreTorneo ??
      torneo.nombre ??
      "Torneo sin nombre"
    );
  };

  // ==========================================================
  // SABER SI UN EQUIPO ESTÁ INSCRITO
  // ==========================================================

  const obtenerInscripcion = (idEquipo, idTorneo) => {
    return inscripciones.find(
      (inscripcion) =>
        Number(inscripcion.id_equipo) === Number(idEquipo) &&
        Number(inscripcion.id_torneo) === Number(idTorneo),
    );
  };

  // ==========================================================
  // CARGANDO
  // ==========================================================

  if (cargando) {
    return (
      <div className="inscripciones-page">
        <p>Cargando torneos e inscripciones...</p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="inscripciones-page">
        <p className="error">{error}</p>
      </div>
    );
  }

  // ==========================================================
  // SIN EQUIPOS
  // ==========================================================

  if (equipos.length === 0) {
    return (
      <div className="inscripciones-page">
        <h1>Inscripciones de equipos</h1>

        <p>No tienes equipos registrados como entrenador.</p>

        <Link to="/equipos/crear">Crear equipo</Link>
      </div>
    );
  }

  // ==========================================================
  // SIN TORNEOS
  // ==========================================================

  if (torneos.length === 0) {
    return (
      <div className="inscripciones-page">
        <h1>Inscripciones de equipos</h1>

        <p>Actualmente no hay torneos disponibles.</p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="inscripciones-page">
      <h1>Inscripciones de equipos</h1>

      <p>Selecciona un torneo para consultar si tus equipos están inscritos.</p>

      {/* ======================================================
          RECORRER TORNEOS
      ====================================================== */}

      {torneos.map((torneo) => {
        const idTorneo = obtenerIdTorneo(torneo);
        const nombreTorneo = obtenerNombreTorneo(torneo);

        return (
          <div className="equipo-inscripciones-bloque" key={idTorneo}>
            {/* ==================================================
                CABECERA DEL TORNEO
            ================================================== */}

            <div className="equipo-header">
              <div>
                <h2>{nombreTorneo}</h2>

                <p>
                  <strong>ID:</strong> {idTorneo}
                </p>

                {torneo.ciudad && (
                  <p>
                    <strong>Ciudad:</strong> {torneo.ciudad}
                  </p>
                )}

                {torneo.estado && (
                  <p>
                    <strong>Estado:</strong> {torneo.estado}
                  </p>
                )}
              </div>
            </div>

            {/* ==================================================
                TABLA DE EQUIPOS
            ================================================== */}

            <table className="tabla-inscripciones">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th>Fecha inscripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {equipos.map((equipo) => {
                  const inscripcion = obtenerInscripcion(
                    equipo.id_equipo,
                    idTorneo,
                  );

                  return (
                    <tr key={`${idTorneo}-${equipo.id_equipo}`}>
                      {/* EQUIPO */}

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {equipo.escudo ? (
                            <img
                              src={equipo.escudo}
                              alt={`Escudo de ${equipo.nombre_equipo}`}
                              style={{
                                width: "45px",
                                height: "45px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div className="sin-escudo">Sin escudo</div>
                          )}

                          <strong>{equipo.nombre_equipo}</strong>
                        </div>
                      </td>

                      {/* ESTADO */}

                      <td>
                        {inscripcion ? (
                          <span
                            className={
                              (inscripcion.estado || "").toLowerCase() ===
                              "inscrito"
                                ? "estado-inscrito"
                                : (inscripcion.estado || "").toLowerCase() ===
                                    "cancelado"
                                  ? "estado-cancelado"
                                  : "estado-pendiente"
                            }
                          >
                            {inscripcion.estado || "Pendiente"}
                          </span>
                        ) : (
                          <span className="estado-pendiente">No inscrito</span>
                        )}
                      </td>

                      {/* FECHA */}

                      <td>
                        {inscripcion
                          ? formatearFecha(inscripcion.fecha_ins_equipo)
                          : "—"}
                      </td>

                      {/* ACCIONES */}

                      <td>
                        {!inscripcion ? (
                          <Link
                            to={`/inscripcionEquipos/crear/${equipo.id_equipo}?id_torneo=${idTorneo}`}
                          >
                            Inscribir equipo
                          </Link>
                        ) : inscripcion.estado === "Pendiente" ? (
                          <Link
                            to={`/inscripcionEquipos/eliminar/${inscripcion.id_inscripcion_e}`}
                          >
                            Retirar solicitud
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
