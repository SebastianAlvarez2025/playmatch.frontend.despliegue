import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getResultadoByEncuentro } from "../../services/resultadosService";
import { getEncuentroDetalle } from "../../services/encuentrosService";
import { getCronologias } from "../../services/cronologiasService";
import { getJugadoresPorEquipo } from "../../services/jugadoresService";

// import "./Veedor.css";

const ResultadoVeedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [encuentro, setEncuentro] = useState(null);

  const [resultado, setResultado] = useState({
    goles_local: 0,
    goles_visitante: 0,
  });

  const [cronologias, setCronologias] = useState([]);

  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // CARGAR DATOS
  // ==========================================================

  useEffect(() => {
    if (!id) return;

    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      // ======================================================
      // OBTENER ENCUENTRO
      // ======================================================

      const encuentroData = await getEncuentroDetalle(id);

      if (!encuentroData) {
        throw new Error("No se encontró el encuentro");
      }

      setEncuentro(encuentroData);

      // ======================================================
      // OBTENER RESULTADO
      // ======================================================

      try {
        const resultadoData = await getResultadoByEncuentro(id);

        const resultadoNormalizado =
          resultadoData?.data ||
          (Array.isArray(resultadoData) ? resultadoData[0] : resultadoData);

        if (resultadoNormalizado) {
          setResultado({
            goles_local: Number(resultadoNormalizado.goles_local) || 0,

            goles_visitante: Number(resultadoNormalizado.goles_visitante) || 0,
          });
        } else {
          setResultado({
            goles_local: 0,
            goles_visitante: 0,
          });
        }
      } catch (errorResultado) {
        console.warn(
          "No se pudo cargar el resultado:",
          errorResultado.response?.data || errorResultado.message,
        );

        setResultado({
          goles_local: 0,
          goles_visitante: 0,
        });
      }

      // ======================================================
      // OBTENER JUGADORES DEL EQUIPO LOCAL
      // ======================================================

      if (encuentroData.id_equipo_local) {
        try {
          const jugadoresA = await getJugadoresPorEquipo(
            encuentroData.id_equipo_local,
          );

          const listaJugadoresA = Array.isArray(jugadoresA)
            ? jugadoresA
            : jugadoresA?.data || [];

          setJugadoresLocal(listaJugadoresA);
        } catch (errorJugadoresLocal) {
          console.error(
            "Error cargando jugadores locales:",
            errorJugadoresLocal.response?.data || errorJugadoresLocal.message,
          );

          setJugadoresLocal([]);
        }
      }

      // ======================================================
      // OBTENER JUGADORES DEL EQUIPO VISITANTE
      // ======================================================

      if (encuentroData.id_equipo_visitante) {
        try {
          const jugadoresB = await getJugadoresPorEquipo(
            encuentroData.id_equipo_visitante,
          );

          const listaJugadoresB = Array.isArray(jugadoresB)
            ? jugadoresB
            : jugadoresB?.data || [];

          setJugadoresVisitante(listaJugadoresB);
        } catch (errorJugadoresVisitante) {
          console.error(
            "Error cargando jugadores visitantes:",
            errorJugadoresVisitante.response?.data ||
              errorJugadoresVisitante.message,
          );

          setJugadoresVisitante([]);
        }
      }

      // ======================================================
      // OBTENER CRONOLOGÍAS
      // ======================================================

      try {
        const cronologiasData = await getCronologias();

        const listaCronologias = Array.isArray(cronologiasData)
          ? cronologiasData
          : cronologiasData?.data || [];

        const cronologiasDelEncuentro = listaCronologias.filter(
          (cronologia) => Number(cronologia.id_encuentro) === Number(id),
        );

        setCronologias(cronologiasDelEncuentro);
      } catch (errorCronologias) {
        console.error(
          "Error cargando cronologías:",
          errorCronologias.response?.data || errorCronologias.message,
        );

        setCronologias([]);
      }
    } catch (error) {
      console.error(
        "Error cargando resultado:",
        error.response?.data || error.message,
      );

      setError("No fue posible cargar el resultado.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================
  // OBTENER JUGADOR
  // ==========================================================

  const obtenerJugador = (idJugador) => {
    return (
      jugadoresLocal.find(
        (jugador) => Number(jugador.id_jugador) === Number(idJugador),
      ) ||
      jugadoresVisitante.find(
        (jugador) => Number(jugador.id_jugador) === Number(idJugador),
      ) ||
      null
    );
  };

  // ==========================================================
  // OBTENER NOMBRE DEL JUGADOR
  // ==========================================================

  const obtenerNombreJugador = (idJugador) => {
    const jugador = obtenerJugador(idJugador);

    if (!jugador) {
      return "Jugador";
    }

    return (
      `${jugador.nombre_usuario || ""} ${
        jugador.apellido_usuario || ""
      }`.trim() || "Jugador"
    );
  };

  // ==========================================================
  // DETERMINAR SI EL JUGADOR ES LOCAL
  // ==========================================================

  const jugadorEsLocal = (idJugador) => {
    return jugadoresLocal.some(
      (jugador) => Number(jugador.id_jugador) === Number(idJugador),
    );
  };

  // ==========================================================
  // OBTENER ICONO DEL EVENTO
  // ==========================================================

  const obtenerIconoEvento = (evento) => {
    switch (evento) {
      case "Gol":
        return "⚽";

      case "Amarilla":
        return "🟨";

      case "Roja":
        return "🟥";

      case "Azul":
        return "🟦";

      default:
        return "•";
    }
  };

  // ==========================================================
  // CRONOLOGÍAS ORDENADAS
  // ==========================================================

  const cronologiasOrdenadas = [...cronologias].sort(
    (a, b) => Number(a.minuto) - Number(b.minuto),
  );

  // ==========================================================
  // CRONOLOGÍAS LOCAL
  // ==========================================================

  const cronologiasLocal = cronologiasOrdenadas.filter((evento) =>
    jugadorEsLocal(evento.id_jugador),
  );

  // ==========================================================
  // CRONOLOGÍAS VISITANTE
  // ==========================================================

  const cronologiasVisitante = cronologiasOrdenadas.filter(
    (evento) => !jugadorEsLocal(evento.id_jugador),
  );

  // ==========================================================
  // CARGANDO
  // ==========================================================

  if (cargando) {
    return (
      <div className="veedor-container">
        <div className="veedor-loading">Cargando resultado...</div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="veedor-container">
        <div className="veedor-error">{error}</div>
      </div>
    );
  }

  // ==========================================================
  // ENCUENTRO NO ENCONTRADO
  // ==========================================================

  if (!encuentro) {
    return (
      <div className="veedor-container">
        <div className="veedor-empty">
          <h2>Encuentro no encontrado</h2>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="veedor-container">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="veedor-header">
        <div>
          <h1>Resultado del encuentro</h1>

          <p>
            {encuentro.equipo_local || "Equipo Local"} vs{" "}
            {encuentro.equipo_visitante || "Equipo Visitante"}
          </p>
        </div>

        <button className="btn-recargar" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>

      {/* ======================================================
          TARJETA DEL RESULTADO
      ====================================================== */}

      <div className="encuentro-veedor-card historial-card">
        {/* ====================================================
            CABECERA
        ==================================================== */}

        <div className="encuentro-card-header">
          <span className="torneo-nombre">
            {encuentro.nombre_torneo || "Torneo"}
          </span>

          <span
            className={`estado ${
              encuentro.estado === "Finalizado" ? "estado-finalizado" : ""
            }`}
          >
            {encuentro.estado || "Finalizado"}
          </span>
        </div>

        {/* ====================================================
            EQUIPOS Y MARCADOR
        ==================================================== */}

        <div className="encuentro-equipos">
          {/* LOCAL */}

          <div className="equipo">
            <span className="equipo-nombre">{encuentro.equipo_local}</span>

            <span className="marcador">{resultado.goles_local}</span>
          </div>

          <span className="vs">-</span>

          {/* VISITANTE */}

          <div className="equipo">
            <span className="equipo-nombre">{encuentro.equipo_visitante}</span>

            <span className="marcador">{resultado.goles_visitante}</span>
          </div>
        </div>

        {/* ====================================================
            INFORMACIÓN
        ==================================================== */}

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
      </div>

      {/* ======================================================
          HISTORIAL DE CRONOLOGÍAS
      ====================================================== */}

      <div className="historial-cronologias">
        <div className="historial-header">
          <h2>Historial del partido</h2>
        </div>

        <div className="historial-columnas">
          {/* ==================================================
              EQUIPO LOCAL
          ================================================== */}

          <div className="historial-equipo historial-local">
            <div className="historial-equipo-header">
              <h3>{encuentro.equipo_local}</h3>
            </div>

            <div className="lista-historial">
              {cronologiasLocal.length > 0 ? (
                cronologiasLocal.map((evento) => {
                  const jugador = obtenerJugador(evento.id_jugador);

                  return (
                    <div
                      className={`historial-evento evento-${(
                        evento.evento || ""
                      ).toLowerCase()}`}
                      key={evento.id_cronologia}
                    >
                      <span className="historial-icono">
                        {obtenerIconoEvento(evento.evento)}
                      </span>

                      <span>
                        <strong>{jugador?.numero_camiseta || "-"}</strong>
                      </span>

                      <span className="historial-jugador">
                        {obtenerNombreJugador(evento.id_jugador)}
                      </span>

                      <span className="historial-minuto">{evento.minuto}'</span>
                    </div>
                  );
                })
              ) : (
                <p className="sin-eventos">No hay eventos registrados</p>
              )}
            </div>
          </div>

          {/* ==================================================
              EQUIPO VISITANTE
          ================================================== */}

          <div className="historial-equipo historial-visitante">
            <div className="historial-equipo-header">
              <h3>{encuentro.equipo_visitante}</h3>
            </div>

            <div className="lista-historial">
              {cronologiasVisitante.length > 0 ? (
                cronologiasVisitante.map((evento) => {
                  const jugador = obtenerJugador(evento.id_jugador);

                  return (
                    <div
                      className={`historial-evento evento-${(
                        evento.evento || ""
                      ).toLowerCase()}`}
                      key={evento.id_cronologia}
                    >
                      <span className="historial-icono">
                        {obtenerIconoEvento(evento.evento)}
                      </span>

                      <span>
                        <strong>{jugador?.numero_camiseta || "-"}</strong>
                      </span>

                      <span className="historial-jugador">
                        {obtenerNombreJugador(evento.id_jugador)}
                      </span>

                      <span className="historial-minuto">{evento.minuto}'</span>
                    </div>
                  );
                })
              ) : (
                <p className="sin-eventos">No hay eventos registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadoVeedor;
