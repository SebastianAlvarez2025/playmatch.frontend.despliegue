// ===================================================================
// MiFicha.jsx
// RF-003 — Actor: Jugador → "Consulta de su propia ficha"
//
// Vista de SOLO LECTURA, en una sola pantalla (sin scroll).
// Muestra:
// 1. Tarjeta de perfil (avatar, nombre, equipo, goles, tarjeta, camiseta)
// 2. Mis Torneos (solo los torneos donde el equipo está INSCRITO,
//    tarjetas pequeñas, clic para cambiar la tabla)
// 3. Posición en el Torneo (tabla de posiciones del torneo abierto)
// 4. Próximos Encuentros / Últimos Partidos / Mi Rendimiento:
//    se calculan con los encuentros y resultados reales del torneo
//    abierto (sin tocar base de datos, solo lo que ya existe).
// ===================================================================

import { useEffect, useState } from "react";

import { getMiFicha } from "../../services/jugadoresService";
import { getInscripcionesPorEquipo } from "../../services/inscripcionesEquipoService";
import { getTablaPosiciones } from "../../services/posicionesService";
import { getEncuentrosByTorneo } from "../../services/encuentrosService";
import { getResultadoByEncuentro } from "../../services/resultadosService";

import "../../styles/estilosPages/jugadores/jugadores.css";

const COLUMNAS_POSICIONES = [
  { key: "nombre_equipo", label: "Equipo" },
  { key: "partidos_jugados", label: "PJ" },
  { key: "ganados", label: "G" },
  { key: "empatados", label: "E" },
  { key: "perdidos", label: "P" },
  { key: "goles_favor", label: "GF" },
  { key: "goles_contra", label: "GC" },
  { key: "diferencia_gol", label: "DG" },
  { key: "puntos", label: "Pts" },
];

// ----------------------------------------------------------------
// FUNCIÓN: infoTarjeta
// ENUM de un solo valor: 'amarillas' | 'azules' | 'rojas' | ''
// ----------------------------------------------------------------
function infoTarjeta(valor) {
  switch (valor) {
    case "amarillas":
      return { emoji: "🟨", texto: "Amarilla" };
    case "rojas":
      return { emoji: "🟥", texto: "Roja" };
    case "azules":
      return { emoji: "🟦", texto: "Azul" };
    default:
      return { emoji: "▫️", texto: "Ninguna" };
  }
}

// ----------------------------------------------------------------
// FUNCIÓN: formatearFecha
// Convierte "2026-08-28" a "28 ago" para que quepa en la tarjetita.
// ----------------------------------------------------------------
function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return fechaISO;
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

export default function MiFicha() {
  const [jugador, setJugador] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [posicionesPorTorneo, setPosicionesPorTorneo] = useState({});
  const [torneoAbierto, setTorneoAbierto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Encuentros del equipo del jugador dentro del torneo abierto,
  // ya separados en próximos y finalizados (con su marcador).
  const [proximosEncuentros, setProximosEncuentros] = useState([]);
  const [ultimosPartidos, setUltimosPartidos] = useState([]);
  const [cargandoEncuentros, setCargandoEncuentros] = useState(false);

  // Se activa si la imagen del escudo falla al cargar,
  // para mostrar el número de camiseta en su lugar dentro del círculo.
  const [escudoFallo, setEscudoFallo] = useState(false);

  const cargarFicha = async () => {
    try {
      setCargando(true);
      setError("");

      const datosJugador = await getMiFicha();
      setJugador(datosJugador);

      if (datosJugador?.id_equipo) {
        const datosInscripciones = await getInscripcionesPorEquipo(
          datosJugador.id_equipo
        );
        setInscripciones(datosInscripciones || []);

        const primerInscrito = (datosInscripciones || []).find(
          (i) => i.estado === "Inscrito"
        );
        if (primerInscrito) {
          setTorneoAbierto(primerInscrito.id_torneo);
        }
      }
    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 404) {
        setError(
          err.response.data?.msg ||
            "Aún no tienes una ficha de jugador registrada."
        );
      } else {
        setError("No se pudo cargar tu ficha de jugador.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFicha();
  }, []);

  useEffect(() => {
    if (torneoAbierto && !posicionesPorTorneo[torneoAbierto]) {
      cargarPosiciones(torneoAbierto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torneoAbierto]);

  // Cada vez que cambia el torneo abierto (o ya tenemos el equipo del
  // jugador), recargamos sus encuentros de ese torneo.
  useEffect(() => {
    if (torneoAbierto && jugador?.id_equipo) {
      cargarEncuentros(torneoAbierto, jugador.id_equipo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torneoAbierto, jugador?.id_equipo]);

  const cargarPosiciones = async (id_torneo) => {
    try {
      const respuesta = await getTablaPosiciones(id_torneo);
      const filas = Array.isArray(respuesta?.data) ? respuesta.data : [];

      setPosicionesPorTorneo((prev) => ({
        ...prev,
        [id_torneo]: filas,
      }));
    } catch (err) {
      console.error(err);
      setPosicionesPorTorneo((prev) => ({
        ...prev,
        [id_torneo]: [],
      }));
    }
  };

  // ----------------------------------------------------------------
  // FUNCIÓN: cargarEncuentros
  // Trae todos los encuentros del torneo abierto, se queda solo con
  // los del equipo del jugador y los separa en "próximos" (Pendiente
  // o Jugando) y "finalizados" (con su marcador ya cargado).
  // ----------------------------------------------------------------
  const cargarEncuentros = async (id_torneo, id_equipo) => {
    try {
      setCargandoEncuentros(true);

      const todos = await getEncuentrosByTorneo(id_torneo);
      const propios = (todos || []).filter(
        (e) =>
          e.id_equipo_local === id_equipo || e.id_equipo_visitante === id_equipo
      );

      // El backend ya los entrega ordenados por jornada/fecha/hora asc.
      const proximos = propios
        .filter((e) => e.estado === "Pendiente" || e.estado === "Jugando")
        .slice(0, 3);

      const finalizados = propios
        .filter((e) => e.estado === "Finalizado")
        .slice(-3)
        .reverse(); // los más recientes primero

      // Para los finalizados, buscamos el marcador de cada uno.
      const finalizadosConMarcador = await Promise.all(
        finalizados.map(async (encuentro) => {
          try {
            const resultado = await getResultadoByEncuentro(
              encuentro.id_encuentro
            );
            return { ...encuentro, resultado };
          } catch (err) {
            console.error(err);
            return { ...encuentro, resultado: null };
          }
        })
      );

      setProximosEncuentros(proximos);
      setUltimosPartidos(finalizadosConMarcador);
    } catch (err) {
      console.error(err);
      setProximosEncuentros([]);
      setUltimosPartidos([]);
    } finally {
      setCargandoEncuentros(false);
    }
  };

  const seleccionarTorneo = (insc) => {
    if (insc.estado !== "Inscrito") return;
    setTorneoAbierto(insc.id_torneo);
  };

  if (cargando) return <p className="mificha-vacio">Cargando...</p>;
  if (error) return <p className="mificha-vacio">{error}</p>;
  if (!jugador) return <p className="mificha-vacio">No se encontró información.</p>;

  const tarjeta = infoTarjeta(jugador.tarjetas);

  // Solo se muestran en "Mis Torneos" las inscripciones donde
  // el equipo está efectivamente INSCRITO (no Cancelado, no otros estados).
  const inscripcionesActivas = inscripciones.filter(
    (i) => i.estado === "Inscrito"
  );

  const filasTorneoAbierto = posicionesPorTorneo[torneoAbierto];
  const torneoSeleccionado = inscripcionesActivas.find(
    (i) => i.id_torneo === torneoAbierto
  );
  const mostrarNumeroEnCirculo = !jugador.escudo || escudoFallo;

  // Partidos jugados en el torneo abierto = encuentros finalizados
  // del equipo del jugador (dato real, no inventado).
  const partidosJugadosTorneo = ultimosPartidos.length;

  return (
    <div className="mificha-container">
      <h1 className="mificha-titulo">Mi Ficha</h1>
      <p className="mificha-subtitulo">
        Toda tu información, torneos y posición en la tabla.
      </p>

      <div className="mificha-grid">
        {/* ============================================= */}
        {/* COLUMNA IZQUIERDA: TARJETA DE PERFIL           */}
        {/* ============================================= */}
        <div className="mificha-card mificha-perfil">
          <div className="mificha-avatar">
            {mostrarNumeroEnCirculo ? (
              <span>{jugador.numero_camiseta}</span>
            ) : (
              <img
                src={jugador.escudo}
                alt="Escudo del equipo"
                onError={() => setEscudoFallo(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <h2 className="mificha-nombre">
            {jugador.nombre_usuario} {jugador.apellido_usuario}
          </h2>
          <p className="mificha-equipo">{jugador.nombre_equipo}</p>

          <div className="mificha-datos-lista">
            <div className="mificha-dato-fila">
              <span>⚽ Goles</span>
              <span>{jugador.goles}</span>
            </div>
            <div className="mificha-dato-fila">
              <span>{tarjeta.emoji} Tarjeta</span>
              <span>{tarjeta.texto}</span>
            </div>
            <div className="mificha-dato-fila">
              <span># Camiseta</span>
              <span>{jugador.numero_camiseta}</span>
            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* COLUMNA DERECHA                                */}
        {/* ============================================= */}
        <div className="mificha-columna-derecha">
          {/* ---- MIS TORNEOS (solo estado Inscrito) ---- */}
          <div className="mificha-card">
            <h3 className="mificha-card-titulo">🏆 Mis Torneos</h3>

            {inscripcionesActivas.length === 0 ? (
              <p className="mificha-vacio">
                Tu equipo no está inscrito actualmente en ningún torneo.
              </p>
            ) : (
              <div className="mificha-torneos-grid">
                {inscripcionesActivas.map((insc) => (
                  <div
                    key={insc.id_inscripcion_e}
                    className={`mificha-torneo-mini ${
                      torneoAbierto === insc.id_torneo ? "activo" : ""
                    }`}
                    onClick={() => seleccionarTorneo(insc)}
                  >
                    <p className="mificha-torneo-mini-nombre">
                      {insc.nombre_torneo}
                    </p>
                    <span className="mificha-torneo-mini-estado inscrito">
                      {insc.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- POSICIÓN EN EL TORNEO ---- */}
          <div className="mificha-card mificha-card-tabla">
            <h3 className="mificha-card-titulo">
              🚩 Posición en el Torneo
              {torneoSeleccionado ? ` — ${torneoSeleccionado.nombre_torneo}` : ""}
            </h3>

            {!torneoAbierto ? (
              <p className="mificha-vacio">
                Selecciona un torneo inscrito para ver la tabla.
              </p>
            ) : !filasTorneoAbierto ? (
              <p className="mificha-vacio">Cargando tabla de posiciones...</p>
            ) : filasTorneoAbierto.length === 0 ? (
              <p className="mificha-vacio">
                Aún no hay tabla de posiciones para este torneo.
              </p>
            ) : (
              <div className="mificha-tabla-wrapper">
                <table className="mificha-tabla">
                  <thead>
                    <tr>
                      {COLUMNAS_POSICIONES.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filasTorneoAbierto.map((fila, i) => (
                      <tr
                        key={fila.id_equipo ?? i}
                        className={
                          fila.id_equipo === jugador.id_equipo
                            ? "fila-mi-equipo"
                            : ""
                        }
                      >
                        {COLUMNAS_POSICIONES.map((col) => (
                          <td key={col.key}>{fila[col.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ---- PRÓXIMOS ENCUENTROS / ÚLTIMOS PARTIDOS / RENDIMIENTO ---- */}
          <div className="mificha-fila-inferior">
            {/* PRÓXIMOS */}
            <div className="mificha-card mificha-card-mini">
              <h3 className="mificha-card-titulo">📅 Próximos</h3>

              {!torneoAbierto ? (
                <div className="mificha-proximamente">Selecciona un torneo</div>
              ) : cargandoEncuentros ? (
                <div className="mificha-proximamente">Cargando...</div>
              ) : proximosEncuentros.length === 0 ? (
                <div className="mificha-proximamente">
                  Sin encuentros programados
                </div>
              ) : (
                <div className="mificha-partidos-lista">
                  {proximosEncuentros.map((e) => (
                    <div key={e.id_encuentro} className="mificha-partido-item">
                      <span className="mificha-partido-fecha">
                        {formatearFecha(e.fecha)}
                      </span>
                      <span className="mificha-partido-equipos">
                        {e.equipo_local} vs {e.equipo_visitante}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ÚLTIMOS PARTIDOS */}
            <div className="mificha-card mificha-card-mini">
              <h3 className="mificha-card-titulo">📊 Últimos Partidos</h3>

              {!torneoAbierto ? (
                <div className="mificha-proximamente">Selecciona un torneo</div>
              ) : cargandoEncuentros ? (
                <div className="mificha-proximamente">Cargando...</div>
              ) : ultimosPartidos.length === 0 ? (
                <div className="mificha-proximamente">
                  Aún no hay partidos jugados
                </div>
              ) : (
                <div className="mificha-partidos-lista">
                  {ultimosPartidos.map((e) => (
                    <div key={e.id_encuentro} className="mificha-partido-item">
                      <span className="mificha-partido-equipos">
                        {e.equipo_local} vs {e.equipo_visitante}
                      </span>
                      <span className="mificha-partido-marcador">
                        {e.resultado
                          ? `${e.resultado.goles_local} - ${e.resultado.goles_visitante}`
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RENDIMIENTO */}
            <div className="mificha-card mificha-card-mini">
              <h3 className="mificha-card-titulo">📈 Rendimiento</h3>

              {!torneoAbierto ? (
                <div className="mificha-proximamente">Selecciona un torneo</div>
              ) : (
                <div className="mificha-rendimiento-lista">
                  <div className="mificha-dato-fila">
                    <span>Partidos Jug.</span>
                    <span>{partidosJugadosTorneo}</span>
                  </div>
                  <div className="mificha-dato-fila">
                    <span>⚽ Goles</span>
                    <span>{jugador.goles}</span>
                  </div>
                  <div className="mificha-dato-fila">
                    <span>{tarjeta.emoji} Tarjeta</span>
                    <span>{tarjeta.texto}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}