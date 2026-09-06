import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getResultadoByEncuentro } from "../../services/resultadosService";
import { getEncuentrosByTorneo } from "../../services/encuentrosService";

import styles from "./ResultadoOrganizador.module.css";

export default function ResultadoOrganizador() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CARGAR RESULTADOS
  // =========================================================

  const cargarResultados = async (lista) => {
    const resultadosTemp = {};
    const encuentrosConResultado = [];

    await Promise.all(
      lista.map(async (encuentro) => {
        try {
          const respuesta = await getResultadoByEncuentro(
            encuentro.id_encuentro,
          );

          if (!respuesta) return;

          const resultado =
            respuesta?.data ||
            (Array.isArray(respuesta) ? respuesta[0] : respuesta);

          if (!resultado) return;

          const idEncuentro = Number(encuentro.id_encuentro);

          resultadosTemp[idEncuentro] = {
            goles_local: Number(resultado.goles_local) || 0,
            goles_visitante: Number(resultado.goles_visitante) || 0,
          };

          encuentrosConResultado.push(encuentro);
        } catch (error) {
          console.error(
            `Error al obtener resultado del encuentro ${encuentro.id_encuentro}:`,
            error,
          );
        }
      }),
    );

    setResultados(resultadosTemp);

    // Mostrar únicamente encuentros con resultado creado
    setEncuentros(encuentrosConResultado);
  };

  // =========================================================
  // CARGAR ENCUENTROS
  // =========================================================

  const cargarEncuentros = async () => {
    try {
      setLoading(true);

      const respuesta = await getEncuentrosByTorneo(id);

      const lista = Array.isArray(respuesta) ? respuesta : [];

      setEncuentros(lista);

      await cargarResultados(lista);
    } catch (error) {
      console.error("Error al cargar encuentros:", error);
      setEncuentros([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INICIALIZAR
  // =========================================================

  useEffect(() => {
    if (!id) return;

    cargarEncuentros();
  }, [id]);

  // =========================================================
  // ACTUALIZAR RESULTADOS CADA SEGUNDO
  // =========================================================

  useEffect(() => {
    const intervalo = setInterval(() => {
      setEncuentros((actuales) => [...actuales]);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // =========================================================
  // ACTUALIZAR CUANDO CAMBIA LOCALSTORAGE
  // =========================================================

  useEffect(() => {
    const actualizarPantalla = () => {
      setEncuentros((actuales) => [...actuales]);
    };

    window.addEventListener("storage", actualizarPantalla);

    return () => {
      window.removeEventListener("storage", actualizarPantalla);
    };
  }, []);

  // =========================================================
  // OBTENER ESTADO DEL PARTIDO
  // =========================================================

  const obtenerEstadoPartido = (idEncuentro, estadoBD) => {
    const estadoLocal =
      localStorage.getItem(`partido_estado_${idEncuentro}`) || "";

    const periodo =
      Number(localStorage.getItem(`partido_periodo_${idEncuentro}`)) || 1;

    // ---------------------------------------------------------
    // FINALIZADO
    // ---------------------------------------------------------

    if (estadoBD === "Finalizado" || estadoLocal === "Finalizado") {
      return {
        tipo: "finalizado",
        texto: "FINALIZADO",
      };
    }

    // ---------------------------------------------------------
    // APLAZADO
    // ---------------------------------------------------------

    if (estadoBD === "Aplazado" || estadoLocal === "Aplazado") {
      return {
        tipo: "aplazado",
        texto: "APLAZADO",
      };
    }

    // ---------------------------------------------------------
    // DESCANSO
    // ---------------------------------------------------------

    if (estadoLocal === "Descanso") {
      return {
        tipo: "descanso",
        texto: "DESCANSO",
      };
    }

    // ---------------------------------------------------------
    // SEGUNDO TIEMPO
    // ---------------------------------------------------------

    if (periodo === 2 || estadoLocal === "Segundo Tiempo") {
      return {
        tipo: "segundo",
        texto: "SEGUNDO TIEMPO",
      };
    }

    // ---------------------------------------------------------
    // PRIMER TIEMPO
    // ---------------------------------------------------------

    return {
      tipo: "primero",
      texto: "PRIMER TIEMPO",
    };
  };

  // =========================================================
  // CALCULAR CRONÓMETRO
  // =========================================================

  const obtenerTiempo = (idEncuentro) => {
    const activo =
      localStorage.getItem(`partido_activo_${idEncuentro}`) === "true";

    const inicio = Number(
      localStorage.getItem(`partido_inicio_${idEncuentro}`),
    );

    let segundos =
      Number(localStorage.getItem(`partido_segundos_${idEncuentro}`)) || 0;

    // Si está corriendo calculamos el tiempo real
    if (activo && inicio) {
      segundos = Math.floor((Date.now() - inicio) / 1000);
    }

    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return (
      `${String(minutos).padStart(2, "0")}:` +
      `${String(segundosRestantes).padStart(2, "0")}`
    );
  };

  // =========================================================
  // AGRUPAR POR JORNADA
  // =========================================================

  const encuentrosPorJornada = encuentros.reduce((acc, encuentro) => {
    const jornada = encuentro.jornada ?? "Sin jornada";

    if (!acc[jornada]) {
      acc[jornada] = [];
    }

    acc[jornada].push(encuentro);

    return acc;
  }, {});

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className={styles.noData}>Cargando fixture y marcadores...</div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className={styles.container}>
      <h2 className={styles.tituloPrincipal}>Panel de Control de Encuentros</h2>

      {encuentros.length === 0 ? (
        <div className={styles.noData}>
          No hay encuentros registrados en este torneo.
        </div>
      ) : (
        Object.entries(encuentrosPorJornada).map(([jornada, partidos]) => (
          <div className={styles.contenedorJornada} key={jornada}>
            <h3 className={styles.tituloJornada}>Jornada {jornada}</h3>

            {partidos.map((encuentro) => {
              const idEncuentro = Number(encuentro.id_encuentro);

              const resultado = resultados[idEncuentro];

              const estado = obtenerEstadoPartido(
                idEncuentro,
                encuentro.estado,
              );

              const tiempo = obtenerTiempo(idEncuentro);

              return (
                <div
                  key={idEncuentro}
                  className={styles.encuentroCard}
                  onClick={() => navigate(`/resultado/${idEncuentro}`)}
                >
                  {/* ========================================= */}
                  {/* ENCABEZADO */}
                  {/* ========================================= */}

                  <div className={styles.metaHeader}>
                    <span>Encuentro #{idEncuentro}</span>

                    <span className={styles.fecha}>
                      {encuentro.fecha
                        ?.split("T")[0]
                        .split("-")
                        .reverse()
                        .join("-")}
                    </span>
                  </div>

                  {/* ========================================= */}
                  {/* PARTIDO */}
                  {/* ========================================= */}

                  <div className={styles.partido}>
                    {/* LOCAL */}

                    <span className={`${styles.equipo} ${styles.equipoLocal}`}>
                      {encuentro.equipo_local}
                    </span>

                    {/* ======================================= */}
                    {/* CENTRO */}
                    {/* ======================================= */}

                    <div className={styles.marcadorCentral}>
                      {/* PERÍODO */}

                      {estado.tipo !== "finalizado" &&
                        estado.tipo !== "aplazado" && (
                          <div
                            className={`${styles.periodoPartido} ${
                              estado.tipo === "segundo"
                                ? styles.periodoSegundo
                                : ""
                            }`}
                          >
                            {estado.texto}
                          </div>
                        )}

                      {/* DESCANSO */}

                      {estado.tipo === "descanso" && (
                        <div
                          className={`${styles.tiempoPartido} ${styles.tiempoDescanso}`}
                        >
                          DESCANSO
                        </div>
                      )}

                      {/* FINALIZADO */}

                      {estado.tipo === "finalizado" && (
                        <div
                          className={`${styles.tiempoPartido} ${styles.tiempoFinalizado}`}
                        >
                          FINALIZADO
                        </div>
                      )}

                      {/* APLAZADO */}

                      {estado.tipo === "aplazado" && (
                        <div
                          className={`${styles.tiempoPartido} ${styles.tiempoAplazado}`}
                        >
                          APLAZADO
                        </div>
                      )}

                      {/* CRONÓMETRO */}

                      {estado.tipo !== "finalizado" &&
                        estado.tipo !== "aplazado" &&
                        estado.tipo !== "descanso" && (
                          <div
                            className={`${styles.tiempoPartido} ${styles.tiempoActivo}`}
                          >
                            {tiempo}
                          </div>
                        )}

                      {/* MARCADOR */}

                      <div className={styles.marcador}>
                        {resultado
                          ? `${resultado.goles_local} - ${resultado.goles_visitante}`
                          : "VS"}
                      </div>
                    </div>

                    {/* VISITANTE */}

                    <span
                      className={`${styles.equipo} ${styles.equipoVisitante}`}
                    >
                      {encuentro.equipo_visitante}
                    </span>
                  </div>

                  {/* ========================================= */}
                  {/* PIE */}
                  {/* ========================================= */}

                  <div className={styles.metaFooter}>
                    <span className={styles.lugar}>
                      📍 {encuentro.lugar || "Cancha no asignada"}
                    </span>

                    <span className={styles.hora}>
                      🕒 {encuentro.hora?.slice(0, 5)} HS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
