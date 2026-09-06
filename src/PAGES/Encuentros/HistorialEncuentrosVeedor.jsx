import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEncuentrosByVeedor } from "../../services/encuentrosService";

import "./veedor.css";

const HistorialEncuentrosVeedor = () => {
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError("");

      const usuario = JSON.parse(localStorage.getItem("usuario"));

      if (!usuario?.id_usuario) {
        setError("No se encontró la información del veedor.");
        return;
      }

      const data = await getEncuentrosByVeedor(usuario.id_usuario);

      // Solo encuentros finalizados
      const finalizados = (data || []).filter(
        (encuentro) => (encuentro.estado || "").toLowerCase() === "finalizado",
      );

      setEncuentros(finalizados);
    } catch (error) {
      console.error("Error cargando historial:", error);

      setError("No fue posible cargar el historial de encuentros.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerNombreEquipo = (encuentro, local = true) => {
    if (local) {
      return encuentro.equipo_local || "Equipo local";
    }

    return encuentro.equipo_visitante || "Equipo visitante";
  };

  if (cargando) {
    return (
      <div className="veedor-container">
        <h1>Historial de encuentros</h1>

        <div className="veedor-loading">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="veedor-container">
      <div className="veedor-header">
        <div>
          <h1>Historial de encuentros</h1>

          <p>Encuentros que ya has supervisado.</p>
        </div>

        <button className="btn-recargar" onClick={cargarHistorial}>
          ↻ Actualizar
        </button>
      </div>

      {error && <div className="veedor-error">{error}</div>}

      {!error && encuentros.length === 0 && (
        <div className="veedor-empty">
          <div className="veedor-empty-icon">📋</div>

          <h2>No hay encuentros en el historial</h2>

          <p>Los encuentros finalizados aparecerán aquí.</p>
        </div>
      )}

      <div className="encuentros-veedor-grid">
        {encuentros.map((encuentro) => (
          <div
            className="encuentro-veedor-card historial-card"
            key={encuentro.id_encuentro}
          >
            {/* CABECERA */}

            <div className="encuentro-card-header">
              <span className="torneo-nombre">
                {encuentro.nombre_torneo || "Torneo"}
              </span>

              <span className="estado estado-finalizado">FINALIZADO</span>
            </div>

            {/* EQUIPOS Y RESULTADO */}

            <div className="encuentro-equipos">
              <div className="equipo">
                <span className="equipo-nombre">
                  {obtenerNombreEquipo(encuentro, true)}
                </span>

                <span className="marcador">{encuentro.goles_local ?? 0}</span>
              </div>

              <span className="vs">-</span>

              <div className="equipo">
                <span className="equipo-nombre">
                  {obtenerNombreEquipo(encuentro, false)}
                </span>

                <span className="marcador">
                  {encuentro.goles_visitante ?? 0}
                </span>
              </div>
            </div>

            {/* INFORMACIÓN */}

            <div className="encuentro-info">
              <div>
                <strong>📅 Fecha</strong>

                <span>
                  {encuentro.fecha
                    ? new Date(encuentro.fecha).toLocaleDateString("es-CO")
                    : "Sin fecha"}
                </span>
              </div>

              <div>
                <strong>🕐 Hora</strong>

                <span>{encuentro.hora || "Sin hora"}</span>
              </div>

              <div>
                <strong>🏟️ Cancha</strong>

                <span>{encuentro.lugar || "Sin cancha"}</span>
              </div>
            </div>

            {/* BOTÓN */}

            <button
              className="btn-ver-encuentro"
              onClick={() =>
                navigate(`/resultado/encuentro/${encuentro.id_encuentro}`)
              }
            >
              Ver encuentro
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialEncuentrosVeedor;
