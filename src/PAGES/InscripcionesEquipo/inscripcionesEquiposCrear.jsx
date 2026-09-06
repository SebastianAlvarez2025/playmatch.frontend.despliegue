/**
 * ==========================================================
 * INSCRIBIR EQUIPO A TORNEO
 * 
 *
 * DESCRIPCIÓN:
 * El DT llega aquí desde "Mis Inscripciones" con el ID de
 * SU equipo ya en la URL. Aquí elige a qué torneo (con
 * inscripciones abiertas) quiere inscribirlo.
 * ==========================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createInscripcion } from "../../services/inscripcionesEquipoService";
import { getTorneos } from "../../services/torneoService";
import "../../styles/estilosPages/inscripcionEquipo/inscripcionCrear.css";

export default function InscripcionesEquiposCrear() {
  const { idEquipo } = useParams();
  const navigate = useNavigate();

  const [torneosAbiertos, setTorneosAbiertos] = useState([]);
  const [idTorneoSeleccionado, setIdTorneoSeleccionado] = useState("");

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Cargamos los torneos y filtramos solo los que están
  // en estado "Inscripciones Abiertas" 
  useEffect(() => {
    const cargarTorneos = async () => {
      try {
        const todos = await getTorneos();
        const abiertos = todos.filter(
          (t) => t.estado === "Inscripciones Abiertas"
        );
        setTorneosAbiertos(abiertos);
      } catch (err) {
        setError("No se pudieron cargar los torneos disponibles.");
      } finally {
        setCargando(false);
      }
    };

    cargarTorneos();
  }, []);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (!idTorneoSeleccionado) {
      setError("Debe seleccionar un torneo.");
      return;
    }

    try {
      setEnviando(true);

      await createInscripcion({
        id_torneo: idTorneoSeleccionado,
        id_equipo: idEquipo,
      });

      alert("Solicitud de inscripción enviada.");
      navigate("/inscripcionEquipos");

    } catch (err) {
      // Mensajes que puede devolver el backend:
      // "El equipo ya está inscrito en este torneo."
      // "El torneo no admite nuevas inscripciones."
      // "No tiene permisos sobre este equipo."
      const mensaje =
        err.response?.data?.message || "No se pudo enviar la inscripción.";
      setError(mensaje);

    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p>Cargando torneos disponibles...</p>;

  return (
    <div className="inscripcion-crear-page">
      <h2>Inscribir equipo a torneo</h2>

      {torneosAbiertos.length === 0 ? (
        <p>No hay torneos con inscripciones abiertas en este momento.</p>
      ) : (
        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label htmlFor="torneo">Selecciona un torneo</label>
            <select
              id="torneo"
              value={idTorneoSeleccionado}
              onChange={(e) => setIdTorneoSeleccionado(e.target.value)}
            >
              <option value="">-- Seleccione --</option>
              {torneosAbiertos.map((t) => (
                <option key={t.id_torneo} value={t.id_torneo}>
                  {t.nombre_torneo}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "ENVIANDO..." : "CONFIRMAR INSCRIPCIÓN"}
          </button>
        </form>
      )}
    </div>
  );
}