/**
 * ==========================================================
 *  INSCRIPCIONES DE UN TORNEO vista organizador
 * ==========================================================
 */

import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getInscripcionesPorTorneo } from "../../services/inscripcionesEquipoService.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ROLES } from "../../constants/roles.js";
import "../../styles/estilosPages/inscripcionEquipo/inscripcionesOrganizador.css";

export default function InscripcionesEquiposOrganizador({ idTorneoProp }) {
  const { id_torneo } = useParams();
  const { user } = useContext(AuthContext);

  const idTorneoFinal = idTorneoProp || id_torneo;

  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await getInscripcionesPorTorneo(idTorneoFinal);

      setInscripciones(data);
    } catch (err) {
      console.error("ERROR AL CARGAR INSCRIPCIONES:", err);
      console.error("STATUS:", err.response?.status);
      console.error("DATA ERROR:", err.response?.data);

      setError("No se pudieron cargar las inscripciones del torneo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idTorneoFinal) {
      cargar();
    }
  }, [idTorneoFinal]);

  // Solo Organizador debería ver los botones de gestión
  const puedeGestionar =
    user?.rol === ROLES.ORGANIZADOR

  const claseEstado = (estado) => {
    if (estado === "Inscrito") return "estado-inscrito";
    if (estado === "Cancelado") return "estado-cancelado";
    return "estado-pendiente";
  };

  if (cargando) return <p>Cargando inscripciones...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="inscripciones-organizador-page">
      <h1>Equipos inscritos al torneo</h1>

      {inscripciones.length === 0 && <p>Aún no hay equipos inscritos.</p>}

      {inscripciones.length > 0 && (
        <table className="tabla-inscripciones">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Fecha de solicitud</th>
              <th>Estado</th>
              {puedeGestionar && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((ins) => (
              <tr key={ins.id_inscripcion_e}>
                <td>{ins.nombre_equipo}</td>
                <td>{new Date(ins.fecha_ins_equipo).toLocaleDateString()}</td>
                <td>
                  <span className={claseEstado(ins.estado)}>{ins.estado}</span>
                </td>

                {/* Solo se puede gestionar mientras está Pendiente */}
                {puedeGestionar && (
                  <td>
                    {ins.estado === "Pendiente" ? (
                      <Link
                        to={`/inscripcionEquipos/editar/${ins.id_inscripcion_e}`}
                      >
                         Gestionar
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
