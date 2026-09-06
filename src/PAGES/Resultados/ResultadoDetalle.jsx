import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getEncuentroDetalle } from "../../services/encuentrosService";

import { getCronologias } from "../../services/cronologiasService";

import { getResultadoByEncuentro } from "../../services/resultadosService";

import { getJugadoresPorEquipo } from "../../services/jugadoresService";

import "../../styles/estilosPages/cronologias/cronologias.css";

export default function ResultadoDetalle() {
  const { id } = useParams();

  const [encuentro, setEncuentro] = useState(null);

  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);

  const [cronologias, setCronologias] = useState([]);

  const [resultado, setResultado] = useState({
    goles_local: 0,
    goles_visitante: 0,
  });

  const [segundos, setSegundos] = useState(0);

  const [estadoPartido, setEstadoPartido] = useState("Pendiente");

  const [periodo, setPeriodo] = useState(1);

  // ==========================================================
  // DATOS DEL PARTIDO
  // ==========================================================

  const equipoLocal = encuentro?.equipo_local?.trim() || "Equipo Local";

  const equipoVisitante =
    encuentro?.equipo_visitante?.trim() || "Equipo Visitante";

  const escudoLocal = encuentro?.escudo_local || null;

  const escudoVisitante = encuentro?.escudo_visitante || null;

  const minutos = Math.floor(segundos / 60);

  const segundosRestantes = segundos % 60;

  // ==========================================================
  // LOCAL STORAGE
  // ==========================================================

  const keyInicio = `partido_inicio_${id}`;
  const keyActivo = `partido_activo_${id}`;
  const keyEstado = `partido_estado_${id}`;
  const keyPeriodo = `partido_periodo_${id}`;
  const keySegundos = `partido_segundos_${id}`;

  // ==========================================================
  // CARGAR ENCUENTRO
  // ==========================================================

  const cargarEncuentro = async () => {
    try {
      const data = await getEncuentroDetalle(id);

      if (!data) {
        throw new Error("No se encontró el encuentro");
      }

      const encuentroNormalizado = {
        ...data,

        id_encuentro: data.id_encuentro ?? data.id ?? id,

        id_equipo_local:
          data.id_equipo_local ?? data.equipo_local_id ?? data.id_local,

        id_equipo_visitante:
          data.id_equipo_visitante ??
          data.equipo_visitante_id ??
          data.id_visitante,

        equipo_local:
          data.equipo_local ??
          data.nombre_equipo_local ??
          data.nombre_local ??
          "Equipo Local",

        equipo_visitante:
          data.equipo_visitante ??
          data.nombre_equipo_visitante ??
          data.nombre_visitante ??
          "Equipo Visitante",

        escudo_local:
          data.escudo_local ??
          data.logo_local ??
          data.escudo_equipo_local ??
          null,

        escudo_visitante:
          data.escudo_visitante ??
          data.logo_visitante ??
          data.escudo_equipo_visitante ??
          null,

        estado: data.estado ?? "Pendiente",
      };

      setEncuentro(encuentroNormalizado);

      setEstadoPartido(encuentroNormalizado.estado);

      // ======================================================
      // JUGADORES
      // Solo se cargan para poder identificar a qué equipo
      // pertenece cada evento del historial.
      // NO SE MUESTRAN EN PANTALLA.
      // ======================================================

      if (encuentroNormalizado.id_equipo_local) {
        try {
          const dataLocal = await getJugadoresPorEquipo(
            encuentroNormalizado.id_equipo_local,
          );

          const listaLocal = Array.isArray(dataLocal)
            ? dataLocal
            : dataLocal?.data || [];

          setJugadoresLocal(listaLocal);
        } catch (error) {
          console.error("Error al cargar jugadores local:", error);

          setJugadoresLocal([]);
        }
      }

      if (encuentroNormalizado.id_equipo_visitante) {
        try {
          const dataVisitante = await getJugadoresPorEquipo(
            encuentroNormalizado.id_equipo_visitante,
          );

          const listaVisitante = Array.isArray(dataVisitante)
            ? dataVisitante
            : dataVisitante?.data || [];

          setJugadoresVisitante(listaVisitante);
        } catch (error) {
          console.error("Error al cargar jugadores visitante:", error);

          setJugadoresVisitante([]);
        }
      }
    } catch (error) {
      console.error(
        "Error al cargar encuentro:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================================
  // CARGAR RESULTADO
  // ==========================================================

  const cargarResultado = async () => {
    try {
      const data = await getResultadoByEncuentro(id);

      const resultadoData =
        data?.data || (Array.isArray(data) ? data[0] : data) || null;

      if (!resultadoData) {
        return;
      }

      setResultado({
        goles_local: Number(resultadoData.goles_local) || 0,

        goles_visitante: Number(resultadoData.goles_visitante) || 0,
      });
    } catch (error) {
      console.error(
        "Error al cargar resultado:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================================
  // CARGAR CRONOLOGÍAS
  // ==========================================================

  const cargarCronologias = async () => {
    try {
      const data = await getCronologias();

      const lista = Array.isArray(data) ? data : data?.data || [];

      const filtradas = lista.filter(
        (cronologia) => Number(cronologia.id_encuentro) === Number(id),
      );

      setCronologias(filtradas);
    } catch (error) {
      console.error(
        "Error al cargar cronologías:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================================
  // CARGAR TODO
  // ==========================================================

  useEffect(() => {
    if (!id) return;

    cargarEncuentro();
    cargarResultado();
    cargarCronologias();
  }, [id]);

  // ==========================================================
  // RECUPERAR CRONÓMETRO
  // ==========================================================

  useEffect(() => {
    if (!id) return;

    const estadoGuardado = localStorage.getItem(keyEstado);

    const periodoGuardado = localStorage.getItem(keyPeriodo);

    const segundosGuardados = localStorage.getItem(keySegundos);

    const activoGuardado = localStorage.getItem(keyActivo);

    const inicioGuardado = localStorage.getItem(keyInicio);

    if (estadoGuardado) {
      setEstadoPartido(estadoGuardado);
    }

    setPeriodo(periodoGuardado === "2" ? 2 : 1);

    if (activoGuardado === "true" && inicioGuardado) {
      const tiempoTranscurrido = Math.floor(
        (Date.now() - Number(inicioGuardado)) / 1000,
      );

      setSegundos(Math.max(0, tiempoTranscurrido));
    } else {
      const segundosGuardadosNumero = Number(segundosGuardados);

      setSegundos(
        Number.isNaN(segundosGuardadosNumero)
          ? 0
          : Math.max(0, segundosGuardadosNumero),
      );
    }
  }, [id, encuentro]);

  // ==========================================================
  // ACTUALIZAR CRONÓMETRO VISUAL
  // ==========================================================

  useEffect(() => {
    const activo = localStorage.getItem(keyActivo);

    const inicio = localStorage.getItem(keyInicio);

    if (activo !== "true" || !inicio) {
      return;
    }

    const intervalo = setInterval(() => {
      const tiempoTranscurrido = Math.floor(
        (Date.now() - Number(inicio)) / 1000,
      );

      setSegundos(Math.max(0, tiempoTranscurrido));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [id]);

  // ==========================================================
  // ICONO EVENTO
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
  // JUGADOR
  // ==========================================================

  const obtenerJugador = (idJugador) => {
    return (
      jugadoresLocal.find(
        (jugador) => Number(jugador.id_jugador) === Number(idJugador),
      ) ||
      jugadoresVisitante.find(
        (jugador) => Number(jugador.id_jugador) === Number(idJugador),
      )
    );
  };

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
  // HISTORIAL
  // ==========================================================

  const cronologiasOrdenadas = [...cronologias].sort(
    (a, b) => Number(a.minuto) - Number(b.minuto),
  );

  const cronologiasLocal = cronologiasOrdenadas.filter((evento) =>
    jugadoresLocal.some(
      (jugador) => Number(jugador.id_jugador) === Number(evento.id_jugador),
    ),
  );

  const cronologiasVisitante = cronologiasOrdenadas.filter((evento) =>
    jugadoresVisitante.some(
      (jugador) => Number(jugador.id_jugador) === Number(evento.id_jugador),
    ),
  );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (!encuentro) {
    return (
      <div className="contenedor-cronologia">
        <p>Cargando resultado...</p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="contenedor-cronologia resultado-detalle">
      {/* ======================================================
          MARCADOR
      ====================================================== */}

      <div className="marcador-header">
        {/* LOCAL */}

        <div className="equipo-marcador">
          {escudoLocal ? (
            <img src={escudoLocal} alt={`Escudo ${equipoLocal}`} />
          ) : (
            <div className="escudo-placeholder">⚽</div>
          )}

          <h3>{equipoLocal}</h3>

          <span className="goles-numero">{resultado.goles_local}</span>
        </div>

        {/* ==================================================
            CRONÓMETRO
        ================================================== */}

        <div className="cronometro-control">
          <h4>{estadoPartido}</h4>

          <div className="tiempo-digital">
            {minutos.toString().padStart(2, "0")}:
            {segundosRestantes.toString().padStart(2, "0")}
          </div>
        </div>

        {/* VISITANTE */}

        <div className="equipo-marcador">
          {escudoVisitante ? (
            <img src={escudoVisitante} alt={`Escudo ${equipoVisitante}`} />
          ) : (
            <div className="escudo-placeholder">⚽</div>
          )}

          <h3>{equipoVisitante}</h3>

          <span className="goles-numero">{resultado.goles_visitante}</span>
        </div>
      </div>

      {/* ======================================================
          HISTORIAL
      ====================================================== */}

      <div className="historial-cronologias">
        <div className="historial-header">
          <h2>Historial del partido</h2>
        </div>

        <div className="historial-columnas">
          {/* LOCAL */}

          <div className="historial-equipo historial-local">
            <div className="historial-equipo-header">
              <h3>{equipoLocal}</h3>
            </div>

            <div className="lista-historial">
              {cronologiasLocal.length > 0 ? (
                cronologiasLocal.map((evento) => (
                  <div
                    className={`historial-evento evento-${evento.evento.toLowerCase()}`}
                    key={evento.id_cronologia}
                  >
                    <span className="historial-icono">
                      {obtenerIconoEvento(evento.evento)}
                    </span>

                    <span>
                      <strong>
                        {obtenerJugador(evento.id_jugador)?.numero_camiseta ||
                          "-"}
                      </strong>
                    </span>

                    <span className="historial-jugador">
                      {obtenerNombreJugador(evento.id_jugador)}
                    </span>

                    <span className="historial-minuto">{evento.minuto}'</span>
                  </div>
                ))
              ) : (
                <p className="sin-eventos">No hay eventos registrados</p>
              )}
            </div>
          </div>

          {/* VISITANTE */}

          <div className="historial-equipo historial-visitante">
            <div className="historial-equipo-header">
              <h3>{equipoVisitante}</h3>
            </div>

            <div className="lista-historial">
              {cronologiasVisitante.length > 0 ? (
                cronologiasVisitante.map((evento) => (
                  <div
                    className={`historial-evento evento-${evento.evento.toLowerCase()}`}
                    key={evento.id_cronologia}
                  >
                    <span className="historial-icono">
                      {obtenerIconoEvento(evento.evento)}
                    </span>

                    <span>
                      <strong>
                        {obtenerJugador(evento.id_jugador)?.numero_camiseta ||
                          "-"}
                      </strong>
                    </span>

                    <span className="historial-jugador">
                      {obtenerNombreJugador(evento.id_jugador)}
                    </span>

                    <span className="historial-minuto">{evento.minuto}'</span>
                  </div>
                ))
              ) : (
                <p className="sin-eventos">No hay eventos registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
