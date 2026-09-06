import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEncuentroDetalle,
  actualizarEstadoEncuentro,
} from "../../services/encuentrosService";

import {
  createCronologia,
  getCronologias,
  deleteCronologia,
} from "../../services/cronologiasService";

import {
  getResultadoByEncuentro,
  createResultado,
  updateResultadoByEncuentro,
} from "../../services/resultadosService";

import { getJugadoresPorEquipo } from "../../services/jugadoresService";

import "../../styles/estilosPages/cronologias/cronologias.css";

export default function CronologiasOrganizador() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [encuentro, setEncuentro] = useState(null);

  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);

  const [equipoAbierto, setEquipoAbierto] = useState(null);
  const [jugadorAbierto, setJugadorAbierto] = useState(null);

  const [segundos, setSegundos] = useState(0);
  const [cronometroActivo, setCronometroActivo] = useState(false);

  const [periodo, setPeriodo] = useState(1);
  const [estadoPartido, setEstadoPartido] = useState("Primer Tiempo");

  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  const [modalEvento, setModalEvento] = useState(null);

  const [cronologias, setCronologias] = useState([]);

  const [resultado, setResultado] = useState({
    goles_local: 0,
    goles_visitante: 0,
  });

  const [estadoInicializado, setEstadoInicializado] = useState(false);

  // ==========================================================
  // MODAL GENERAL
  // ==========================================================

  const [modalGeneral, setModalGeneral] = useState({
    abierto: false,
    tipo: "info",
    titulo: "",
    mensaje: "",
    mostrarCancelar: false,
    textoConfirmar: "Aceptar",
    textoCancelar: "Cancelar",
    onConfirmar: null,
  });

  const cerrarModalGeneral = () => {
    setModalGeneral({
      abierto: false,
      tipo: "info",
      titulo: "",
      mensaje: "",
      mostrarCancelar: false,
      textoConfirmar: "Aceptar",
      textoCancelar: "Cancelar",
      onConfirmar: null,
    });
  };

  const mostrarModal = ({
    tipo = "info",
    titulo = "",
    mensaje = "",
    mostrarCancelar = false,
    textoConfirmar = "Aceptar",
    textoCancelar = "Cancelar",
    onConfirmar = null,
  }) => {
    setModalGeneral({
      abierto: true,
      tipo,
      titulo,
      mensaje,
      mostrarCancelar,
      textoConfirmar,
      textoCancelar,
      onConfirmar,
    });
  };

  const confirmarModal = async () => {
    if (modalGeneral.onConfirmar) {
      await modalGeneral.onConfirmar();
    }

    cerrarModalGeneral();
  };

  // ==========================================================
  // DATOS
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
        throw new Error("No se encontró información del encuentro");
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

        // ======================================================
        // ESCUDOS
        // ======================================================

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

      const periodoGuardado = localStorage.getItem(keyPeriodo);

      const estadoGuardado = localStorage.getItem(keyEstado);

      const estaEnSegundoTiempo =
        periodoGuardado === "2" &&
        (estadoGuardado === "Segundo Tiempo" || estadoGuardado === "Descanso");

      if (encuentroNormalizado.estado === "Pendiente" && !estaEnSegundoTiempo) {
        localStorage.removeItem(keyInicio);
        localStorage.removeItem(keyActivo);

        localStorage.setItem(keyEstado, "Primer Tiempo");

        localStorage.setItem(keyPeriodo, "1");

        localStorage.setItem(keySegundos, "0");

        setEstadoPartido("Primer Tiempo");
        setPeriodo(1);
        setSegundos(0);
        setCronometroActivo(false);
      }

      // ======================================================
      // JUGADORES LOCAL
      // ======================================================

      if (encuentroNormalizado.id_equipo_local) {
        try {
          const jugadoresA = await getJugadoresPorEquipo(
            encuentroNormalizado.id_equipo_local,
          );

          const listaJugadoresA = Array.isArray(jugadoresA)
            ? jugadoresA
            : jugadoresA?.data || [];

          setJugadoresLocal(listaJugadoresA);
        } catch (error) {
          console.error("Error al cargar jugadores del equipo local:", error);

          setJugadoresLocal([]);
        }
      } else {
        setJugadoresLocal([]);
      }

      // ======================================================
      // JUGADORES VISITANTE
      // ======================================================

      if (encuentroNormalizado.id_equipo_visitante) {
        try {
          const jugadoresB = await getJugadoresPorEquipo(
            encuentroNormalizado.id_equipo_visitante,
          );

          const listaJugadoresB = Array.isArray(jugadoresB)
            ? jugadoresB
            : jugadoresB?.data || [];

          setJugadoresVisitante(listaJugadoresB);
        } catch (error) {
          console.error(
            "Error al cargar jugadores del equipo visitante:",
            error,
          );

          setJugadoresVisitante([]);
        }
      } else {
        setJugadoresVisitante([]);
      }
    } catch (error) {
      console.error(
        "Error al cargar el encuentro:",
        error.response?.data || error.message,
      );

      mostrarModal({
        tipo: "error",
        titulo: "Error",
        mensaje: "No se pudo cargar la información del encuentro.",
      });
    }
  };

  // ==========================================================
  // CARGAR RESULTADO
  // ==========================================================

  const cargarResultado = async () => {
    try {
      const data = await getResultadoByEncuentro(id);

      if (!data) {
        setResultado({
          goles_local: 0,
          goles_visitante: 0,
        });

        return;
      }

      const resultadoData = data?.data || data?.[0] || data;

      setResultado({
        goles_local: Number(resultadoData?.goles_local) || 0,

        goles_visitante: Number(resultadoData?.goles_visitante) || 0,
      });
    } catch (error) {
      setResultado({
        goles_local: 0,
        goles_visitante: 0,
      });
    }
  };

  // ==========================================================
  // CREAR RESULTADO INICIAL
  // ==========================================================

  const crearResultadoInicial = async () => {
    try {
      const respuesta = await getResultadoByEncuentro(id);

      const resultadoExistente =
        respuesta?.data ||
        (Array.isArray(respuesta) ? respuesta[0] : respuesta) ||
        null;

      if (resultadoExistente?.id_resultado) {
        setResultado({
          goles_local: Number(resultadoExistente.goles_local) || 0,

          goles_visitante: Number(resultadoExistente.goles_visitante) || 0,
        });

        return resultadoExistente;
      }

      const nuevoResultado = await createResultado({
        id_encuentro: Number(id),
        goles_local: 0,
        goles_visitante: 0,
      });

      setResultado({
        goles_local: 0,
        goles_visitante: 0,
      });

      return nuevoResultado;
    } catch (error) {
      console.error(
        "Error al crear el resultado inicial:",
        error.response?.data || error.message,
      );

      throw error;
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
        "Error al cargar las cronologías:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================================
  // EFECTOS INICIALES
  // ==========================================================

  useEffect(() => {
    if (!id) return;

    cargarEncuentro();
    cargarCronologias();
    cargarResultado();
  }, [id]);

  // ==========================================================
  // RECUPERAR CRONÓMETRO
  // ==========================================================

  useEffect(() => {
    if (!id || !encuentro) return;

    const estadoGuardado = localStorage.getItem(keyEstado);

    const periodoGuardado = localStorage.getItem(keyPeriodo);

    const segundosGuardados = localStorage.getItem(keySegundos);

    const activoGuardado = localStorage.getItem(keyActivo);

    const inicioGuardado = localStorage.getItem(keyInicio);

    const segundoTiempoGuardado = periodoGuardado === "2";

    if (encuentro.estado === "Pendiente" && !segundoTiempoGuardado) {
      setEstadoPartido("Primer Tiempo");
      setPeriodo(1);
      setSegundos(0);
      setCronometroActivo(false);

      localStorage.setItem(keyEstado, "Primer Tiempo");

      localStorage.setItem(keyPeriodo, "1");

      localStorage.setItem(keySegundos, "0");

      localStorage.removeItem(keyInicio);
      localStorage.removeItem(keyActivo);

      setEstadoInicializado(true);

      return;
    }

    if (estadoGuardado) {
      setEstadoPartido(estadoGuardado);
    } else if (encuentro.estado === "Descanso") {
      setEstadoPartido("Descanso");
    } else if (encuentro.estado === "Finalizado") {
      setEstadoPartido("Finalizado");
    } else if (encuentro.estado === "Aplazado") {
      setEstadoPartido("Aplazado");
    } else {
      setEstadoPartido(
        segundoTiempoGuardado ? "Segundo Tiempo" : "Primer Tiempo",
      );
    }

    setPeriodo(periodoGuardado === "2" ? 2 : 1);

    let segundosRecuperados = Number(segundosGuardados);

    if (Number.isNaN(segundosRecuperados)) {
      segundosRecuperados = 0;
    }

    if (activoGuardado === "true" && inicioGuardado) {
      const tiempoTranscurrido = Math.floor(
        (Date.now() - Number(inicioGuardado)) / 1000,
      );

      setSegundos(Math.max(0, tiempoTranscurrido));

      setCronometroActivo(true);
    } else {
      setSegundos(Math.max(0, segundosRecuperados));

      setCronometroActivo(false);
    }

    setEstadoInicializado(true);
  }, [id, encuentro]);

  // ==========================================================
  // GUARDAR SEGUNDOS
  // ==========================================================

  useEffect(() => {
    if (!id || !estadoInicializado) return;

    localStorage.setItem(keySegundos, String(segundos));
  }, [segundos, id, estadoInicializado]);

  // ==========================================================
  // GUARDAR ESTADO
  // ==========================================================

  useEffect(() => {
    if (!id || !estadoInicializado) return;

    localStorage.setItem(keyEstado, estadoPartido);
  }, [estadoPartido, id, estadoInicializado]);

  // ==========================================================
  // GUARDAR PERIODO
  // ==========================================================

  useEffect(() => {
    if (!id || !estadoInicializado) return;

    localStorage.setItem(keyPeriodo, String(periodo));
  }, [periodo, id, estadoInicializado]);

  // ==========================================================
  // CRONÓMETRO
  // ==========================================================

  useEffect(() => {
    if (!cronometroActivo) return;

    const intervalo = setInterval(() => {
      setSegundos((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cronometroActivo]);

  // ==========================================================
  // ESTADÍSTICAS
  // ==========================================================

  const obtenerEstadisticasJugador = (idJugador) => {
    const eventos = cronologias.filter(
      (cronologia) => Number(cronologia.id_jugador) === Number(idJugador),
    );

    return {
      goles: eventos.filter((evento) => evento.evento === "Gol").length,

      amarillas: eventos.filter((evento) => evento.evento === "Amarilla")
        .length,

      rojas: eventos.filter((evento) => evento.evento === "Roja").length,

      azules: eventos.filter((evento) => evento.evento === "Azul").length,
    };
  };

  // ==========================================================
  // VERIFICAR ROJA
  // ==========================================================

  const jugadorTieneRoja = (idJugador) => {
    return cronologias.some(
      (cronologia) =>
        Number(cronologia.id_jugador) === Number(idJugador) &&
        cronologia.evento === "Roja",
    );
  };

  // ==========================================================
  // EQUIPO
  // ==========================================================

  const seleccionarEquipo = (equipo) => {
    setEquipoAbierto((actual) => (actual === equipo ? null : equipo));

    setJugadorAbierto(null);
  };

  // ==========================================================
  // JUGADOR
  // ==========================================================

  const seleccionarJugador = (jugador) => {
    setJugadorAbierto((actual) =>
      actual === jugador.id_jugador ? null : jugador.id_jugador,
    );
  };

  // ==========================================================
  // SELECCIONAR EVENTO
  // ==========================================================

  const seleccionarEvento = (jugador, evento) => {
    if (jugadorTieneRoja(jugador.id_jugador)) {
      mostrarModal({
        tipo: "advertencia",
        titulo: "Jugador expulsado",
        mensaje: `${jugador.nombre_usuario} ${jugador.apellido_usuario} ya recibió tarjeta roja y no puede registrar más eventos.`,
      });

      return;
    }

    if (!cronometroActivo) {
      mostrarModal({
        tipo: "advertencia",
        titulo: "Cronómetro detenido",
        mensaje: "Debes iniciar el cronómetro para registrar un evento.",
      });

      return;
    }

    setJugadorSeleccionado(jugador);

    setModalEvento(evento);
  };

  // ==========================================================
  // GUARDAR EVENTO
  // ==========================================================

  const guardarEvento = async () => {
    if (!jugadorSeleccionado || !modalEvento) {
      return;
    }

    try {
      const minutoActual =
        periodo === 1
          ? Math.max(1, Math.ceil(segundos / 60))
          : 45 + Math.max(1, Math.ceil(segundos / 60));

      await createCronologia({
        id_encuentro: Number(id),
        id_jugador: jugadorSeleccionado.id_jugador,
        evento: modalEvento,
        minuto: minutoActual,
      });

      await cargarCronologias();

      if (modalEvento === "Gol") {
        await recalcularResultado();
      }

      limpiarSeleccion();
    } catch (error) {
      console.error(
        "Error al guardar el evento:",
        error.response?.data || error.message,
      );

      mostrarModal({
        tipo: "error",
        titulo: "Error",
        mensaje: "No se pudo registrar el evento.",
      });
    }
  };

  // ==========================================================
  // RECALCULAR RESULTADO
  // ==========================================================

  const recalcularResultado = async () => {
    try {
      const data = await getCronologias();

      const lista = Array.isArray(data) ? data : data?.data || [];

      const eventosGol = lista.filter(
        (cronologia) =>
          Number(cronologia.id_encuentro) === Number(id) &&
          cronologia.evento === "Gol",
      );

      const golesLocal = eventosGol.filter((gol) =>
        jugadoresLocal.some(
          (jugador) => Number(jugador.id_jugador) === Number(gol.id_jugador),
        ),
      ).length;

      const golesVisitante = eventosGol.filter((gol) =>
        jugadoresVisitante.some(
          (jugador) => Number(jugador.id_jugador) === Number(gol.id_jugador),
        ),
      ).length;

      let resultadoExistente = null;

      try {
        const respuesta = await getResultadoByEncuentro(id);

        resultadoExistente =
          respuesta?.data ||
          (Array.isArray(respuesta) ? respuesta[0] : respuesta) ||
          null;
      } catch (error) {
        if (error.response?.status === 404) {
          resultadoExistente = null;
        } else {
          throw error;
        }
      }

      if (resultadoExistente?.id_resultado) {
        await updateResultadoByEncuentro(id, {
          goles_local: golesLocal,

          goles_visitante: golesVisitante,
        });
      } else {
        await createResultado({
          id_encuentro: Number(id),

          goles_local: golesLocal,

          goles_visitante: golesVisitante,
        });
      }

      await cargarResultado();
    } catch (error) {
      console.error(
        "Error al recalcular el resultado:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================================
  // LIMPIAR SELECCIÓN
  // ==========================================================

  const limpiarSeleccion = () => {
    setModalEvento(null);
    setJugadorSeleccionado(null);
  };

  // ==========================================================
  // ACTUALIZAR ESTADO
  // ==========================================================

  const actualizarEstado = async (estado) => {
    try {
      await actualizarEstadoEncuentro(id, estado);

      setEncuentro((actual) =>
        actual
          ? {
              ...actual,
              estado,
            }
          : actual,
      );
    } catch (error) {
      console.error(
        "Error al actualizar el estado:",
        error.response?.data || error.message,
      );

      throw error;
    }
  };

  // ==========================================================
  // INICIAR / REANUDAR
  // ==========================================================

  const iniciarCronometro = async () => {
    if (cronometroActivo) return;

    try {
      await crearResultadoInicial();

      if (periodo === 1) {
        setEstadoPartido("Primer Tiempo");

        localStorage.setItem(keyEstado, "Primer Tiempo");

        localStorage.setItem(keyPeriodo, "1");

        if (segundos === 0 && encuentro?.estado !== "Jugando") {
          await actualizarEstado("Jugando");
        }
      }

      if (periodo === 2) {
        setEstadoPartido("Segundo Tiempo");

        localStorage.setItem(keyEstado, "Segundo Tiempo");

        localStorage.setItem(keyPeriodo, "2");

        if (encuentro?.estado !== "Jugando") {
          await actualizarEstado("Jugando");
        }
      }

      const inicio = Date.now() - segundos * 1000;

      localStorage.setItem(keyInicio, String(inicio));

      localStorage.setItem(keyActivo, "true");

      setCronometroActivo(true);
    } catch (error) {
      console.error(
        "Error al iniciar el encuentro:",
        error.response?.data || error.message,
      );

      mostrarModal({
        tipo: "error",
        titulo: "Error",
        mensaje:
          "No se pudo iniciar el encuentro ni crear el resultado inicial.",
      });
    }
  };

  // ==========================================================
  // PAUSAR
  // ==========================================================

  const pausarCronometro = () => {
    localStorage.setItem(keySegundos, String(segundos));

    localStorage.removeItem(keyActivo);

    localStorage.removeItem(keyInicio);

    setCronometroActivo(false);
  };

  // ==========================================================
  // REINICIAR
  // ==========================================================

  const reiniciarCronometro = () => {
    mostrarModal({
      tipo: "confirmacion",
      titulo: "Reiniciar cronómetro",
      mensaje: "¿Deseas reiniciar el cronómetro a 00:00?",
      mostrarCancelar: true,
      textoConfirmar: "Reiniciar",
      textoCancelar: "Cancelar",

      onConfirmar: () => {
        setCronometroActivo(false);
        setSegundos(0);

        localStorage.setItem(keySegundos, "0");

        localStorage.removeItem(keyInicio);

        localStorage.removeItem(keyActivo);
      },
    });
  };

  // ==========================================================
  // FINALIZAR PRIMER TIEMPO
  // ==========================================================

  const finalizarPrimerTiempo = async () => {
    try {
      setCronometroActivo(false);

      localStorage.removeItem(keyActivo);

      localStorage.removeItem(keyInicio);

      setPeriodo(1);
      setEstadoPartido("Descanso");

      localStorage.setItem(keyPeriodo, "1");

      localStorage.setItem(keyEstado, "Descanso");

      if (encuentro?.estado !== "Jugando") {
        await actualizarEstado("Jugando");
      }
    } catch (error) {
      console.error(
        "Error al finalizar el primer tiempo:",
        error.response?.data || error.message,
      );

      mostrarModal({
        tipo: "error",
        titulo: "Error",
        mensaje: "No se pudo finalizar el primer tiempo.",
      });
    }
  };

  // ==========================================================
  // PREPARAR SEGUNDO TIEMPO
  // ==========================================================

  const prepararSegundoTiempo = () => {
    setCronometroActivo(false);
    setSegundos(0);
    setPeriodo(2);

    setEstadoPartido("Segundo Tiempo");

    localStorage.setItem(keyPeriodo, "2");

    localStorage.setItem(keyEstado, "Segundo Tiempo");

    localStorage.setItem(keySegundos, "0");

    localStorage.removeItem(keyInicio);

    localStorage.removeItem(keyActivo);
  };

  // ==========================================================
  // FINALIZAR PARTIDO
  // ==========================================================

  const finalizarPartido = () => {
    mostrarModal({
      tipo: "confirmacion",
      titulo: "Terminar partido",
      mensaje: "¿Qué deseas hacer con este partido?",
      mostrarCancelar: true,
      textoConfirmar: "Finalizar partido",
      textoCancelar: "Aplazar partido",

      onConfirmar: async () => {
        await cambiarEstadoFinal("Finalizado");
      },
    });
  };

  // ==========================================================
  // CAMBIAR ESTADO FINAL
  // ==========================================================

  const cambiarEstadoFinal = async (nuevoEstado) => {
    try {
      setCronometroActivo(false);

      localStorage.setItem(keySegundos, String(segundos));

      localStorage.removeItem(keyInicio);

      localStorage.removeItem(keyActivo);

      await actualizarEstado(nuevoEstado);

      localStorage.setItem(keyEstado, nuevoEstado);

      setEstadoPartido(nuevoEstado);

      mostrarModal({
        tipo: "exito",
        titulo:
          nuevoEstado === "Finalizado"
            ? "Partido finalizado"
            : "Partido aplazado",

        mensaje:
          nuevoEstado === "Finalizado"
            ? "El partido ha sido finalizado correctamente."
            : "El partido ha sido aplazado correctamente.",
      });

      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error(
        "Error al cambiar el estado:",
        error.response?.data || error.message,
      );

      mostrarModal({
        tipo: "error",
        titulo: "Error",
        mensaje: "No se pudo actualizar el estado del partido.",
      });
    }
  };

  // ==========================================================
  // ELIMINAR EVENTO
  // ==========================================================

  const eliminarEvento = (evento) => {
    mostrarModal({
      tipo: "confirmacion",
      titulo: "Eliminar evento",

      mensaje: `¿Deseas eliminar este ${evento.evento.toLowerCase()} del minuto ${evento.minuto}?`,

      mostrarCancelar: true,

      textoConfirmar: "Eliminar",
      textoCancelar: "Cancelar",

      onConfirmar: async () => {
        try {
          await deleteCronologia(evento.id_cronologia);

          await cargarCronologias();

          if (evento.evento === "Gol") {
            await recalcularResultado();
          }
        } catch (error) {
          console.error(
            "Error al eliminar el evento:",
            error.response?.data || error.message,
          );

          mostrarModal({
            tipo: "error",
            titulo: "Error",
            mensaje: "No se pudo eliminar el evento.",
          });
        }
      },
    });
  };

  // ==========================================================
  // ICONOS
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
  // RENDER JUGADOR
  // ==========================================================

  const renderJugador = (jugador) => {
    const estadisticas = obtenerEstadisticasJugador(jugador.id_jugador);

    const nombre =
      `${jugador.nombre_usuario || ""} ${
        jugador.apellido_usuario || ""
      }`.trim() || "Jugador";

    const estaAbierto = jugadorAbierto === jugador.id_jugador;

    const jugadorExpulsado = jugadorTieneRoja(jugador.id_jugador);

    const eventosJugador = cronologias
      .filter(
        (evento) => Number(evento.id_jugador) === Number(jugador.id_jugador),
      )
      .sort((a, b) => Number(a.minuto) - Number(b.minuto));

    return (
      <div
        className={`jugador-lista ${estaAbierto ? "jugador-abierto" : ""}`}
        key={jugador.id_jugador}
      >
        <div
          className={`jugador-info ${estaAbierto ? "jugador-activo" : ""}`}
          onClick={() => seleccionarJugador(jugador)}
        >
          <div className="jugador-bloque">
            <span className="numero-camiseta">#{jugador.numero_camiseta}</span>

            <strong>{nombre}</strong>
          </div>

          {!estaAbierto && (
            <div className="datos-jugador">
              <div className="estadisticas-jugador">
                {estadisticas.goles > 0 && <span>⚽ {estadisticas.goles}</span>}

                {estadisticas.amarillas > 0 && (
                  <span>🟨 {estadisticas.amarillas}</span>
                )}

                {estadisticas.rojas > 0 && <span>🟥 {estadisticas.rojas}</span>}

                {estadisticas.azules > 0 && (
                  <span>🟦 {estadisticas.azules}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {estaAbierto && (
          <div className="detalle-jugador">
            {jugadorExpulsado && (
              <div className="jugador-expulsado">🟥 Jugador expulsado</div>
            )}

            {eventosJugador.length > 0 && (
              <div className="eventos-jugador">
                <h4 className="evento-titulo">Eventos registrados</h4>

                {eventosJugador.map((evento) => (
                  <div
                    className={`evento-jugador evento-${evento.evento.toLowerCase()}`}
                    key={evento.id_cronologia}
                  >
                    <div className="evento-informacion">
                      <span className="evento-icono">
                        {obtenerIconoEvento(evento.evento)}
                      </span>

                      <span className="evento-nombre">{evento.evento}</span>

                      <span className="evento-minuto">{evento.minuto}'</span>
                    </div>

                    <button
                      className="btn-eliminar-evento"
                      title={`Eliminar ${evento.evento}`}
                      onClick={(e) => {
                        e.stopPropagation();

                        eliminarEvento(evento);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="acciones-jugador">
              <button
                className={`btn-jugador gol ${
                  jugadorExpulsado ? "evento-bloqueado" : ""
                }`}
                disabled={jugadorExpulsado}
                onClick={(e) => {
                  e.stopPropagation();

                  seleccionarEvento(jugador, "Gol");
                }}
              >
                ⚽ Gol
              </button>

              <button
                className={`btn-jugador amarilla ${
                  jugadorExpulsado ? "evento-bloqueado" : ""
                }`}
                disabled={jugadorExpulsado}
                onClick={(e) => {
                  e.stopPropagation();

                  seleccionarEvento(jugador, "Amarilla");
                }}
              >
                🟨 Amarilla
              </button>

              <button
                className={`btn-jugador roja ${
                  jugadorExpulsado ? "evento-bloqueado" : ""
                }`}
                disabled={jugadorExpulsado}
                onClick={(e) => {
                  e.stopPropagation();

                  seleccionarEvento(jugador, "Roja");
                }}
              >
                🟥 Roja
              </button>

              <button
                className={`btn-jugador azul ${
                  jugadorExpulsado ? "evento-bloqueado" : ""
                }`}
                disabled={jugadorExpulsado}
                onClick={(e) => {
                  e.stopPropagation();

                  seleccionarEvento(jugador, "Azul");
                }}
              >
                🟦 Azul
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================
  // HISTORIAL
  // ==========================================================

  const obtenerJugador = (idJugador) => {
    return (
      jugadoresLocal.find((j) => Number(j.id_jugador) === Number(idJugador)) ||
      jugadoresVisitante.find((j) => Number(j.id_jugador) === Number(idJugador))
    );
  };

  const obtenerNombreJugador = (idJugador) => {
    const jugador =
      jugadoresLocal.find((j) => Number(j.id_jugador) === Number(idJugador)) ||
      jugadoresVisitante.find(
        (j) => Number(j.id_jugador) === Number(idJugador),
      );

    if (!jugador) {
      return "Jugador";
    }

    return (
      `${jugador.nombre_usuario || ""} ${
        jugador.apellido_usuario || ""
      }`.trim() || "Jugador"
    );
  };

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
  // RENDER
  // ==========================================================

  return (
    <div className="contenedor-cronologia">
      {/* ======================================================
          MARCADOR
      ====================================================== */}

      <div className="marcador-header">
        {/* LOCAL */}

        <div
          className={`equipo-marcador ${
            equipoAbierto === "local" ? "equipo-activo" : ""
          }`}
          onClick={() => seleccionarEquipo("local")}
        >
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

          <div className="acciones-tiempo">
            {!cronometroActivo && estadoPartido !== "Finalizado" && (
              <button
                className="btn-control play"
                onClick={() =>
                  estadoPartido === "Descanso"
                    ? prepararSegundoTiempo()
                    : iniciarCronometro()
                }
              >
                ▶{" "}
                {estadoPartido === "Descanso"
                  ? "Segundo Tiempo"
                  : segundos > 0 || estadoPartido === "Aplazado"
                    ? "Reanudar"
                    : "Iniciar"}
              </button>
            )}

            {cronometroActivo && (
              <button className="btn-control pause" onClick={pausarCronometro}>
                ⏸ Pausar
              </button>
            )}

            <button
              className="btn-control reset"
              onClick={reiniciarCronometro}
              disabled={segundos === 0}
            >
              ↻ Reiniciar
            </button>

            {estadoPartido === "Primer Tiempo" && (
              <button
                className="btn-control next"
                onClick={finalizarPrimerTiempo}
              >
                ⏭ Fin 1T
              </button>
            )}

            {estadoPartido !== "Finalizado" && (
              <button className="btn-control end" onClick={finalizarPartido}>
                🏁 Terminar Partido
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            VISITANTE
        ================================================== */}

        <div
          className={`equipo-marcador ${
            equipoAbierto === "visitante" ? "equipo-activo" : ""
          }`}
          onClick={() => seleccionarEquipo("visitante")}
        >
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
          JUGADORES
      ====================================================== */}

      {equipoAbierto && (
        <div className="contenedor-jugadores">
          <div className="titulo-jugadores">
            <h2>{equipoAbierto === "local" ? equipoLocal : equipoVisitante}</h2>

            <button
              onClick={() => {
                setEquipoAbierto(null);

                setJugadorAbierto(null);
              }}
            >
              ✕
            </button>
          </div>

          <div className="lista-jugadores">
            {equipoAbierto === "local" ? (
              jugadoresLocal.length > 0 ? (
                jugadoresLocal.map(renderJugador)
              ) : (
                <p>Este equipo no tiene jugadores registrados.</p>
              )
            ) : jugadoresVisitante.length > 0 ? (
              jugadoresVisitante.map(renderJugador)
            ) : (
              <p>Este equipo no tiene jugadores registrados.</p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          HISTORIAL
          SIN ESCUDOS
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

      {/* ======================================================
          MODAL EVENTO
      ====================================================== */}

      {modalEvento && (
        <div className="modal-confirmacion">
          <div className="modal-contenido">
            <h3>Registrar {modalEvento}</h3>

            <p>
              Jugador:{" "}
              <strong>
                {jugadorSeleccionado
                  ? `${jugadorSeleccionado.nombre_usuario} ${jugadorSeleccionado.apellido_usuario}`
                  : ""}
              </strong>
            </p>

            <p>
              Minuto:{" "}
              <strong>
                {periodo === 1
                  ? Math.max(1, Math.ceil(segundos / 60))
                  : 45 + Math.max(1, Math.ceil(segundos / 60))}
              </strong>
            </p>

            <div className="modal-acciones">
              <button onClick={guardarEvento}>Confirmar</button>

              <button onClick={limpiarSeleccion}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL GENERAL
      ====================================================== */}

      {modalGeneral.abierto && (
        <div className="modal-confirmacion">
          <div className="modal-contenido">
            <h3>{modalGeneral.titulo}</h3>

            <p>{modalGeneral.mensaje}</p>

            <div className="modal-acciones">
              {modalGeneral.mostrarCancelar &&
                modalGeneral.titulo === "Terminar partido" && (
                  <button
                    className="btn-aplazar"
                    onClick={async () => {
                      cerrarModalGeneral();

                      await cambiarEstadoFinal("Aplazado");
                    }}
                  >
                    Aplazar partido
                  </button>
                )}

              <button className="btn-confirmar" onClick={confirmarModal}>
                {modalGeneral.textoConfirmar}
              </button>

              {modalGeneral.mostrarCancelar &&
                modalGeneral.titulo !== "Terminar partido" && (
                  <button className="btn-cancelar" onClick={cerrarModalGeneral}>
                    {modalGeneral.textoCancelar}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
