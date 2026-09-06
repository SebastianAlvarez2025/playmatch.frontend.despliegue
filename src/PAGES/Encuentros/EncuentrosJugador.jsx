// ===================================================================
// EncuentrosJugador.jsx
// Muestra el calendario de encuentros de UN torneo específico
// (agrupados por jornada), tomando el ID del torneo desde la URL.
//
// FIX: antes, si no llegaba un id de torneo en la URL (por ejemplo,
// al entrar desde el menú lateral sin haber elegido un torneo), la
// función se salía sin nunca quitar el estado "loading", y la
// pantalla se quedaba pegada en "Cargando..." para siempre. Ahora
// se apaga el loading igual y se muestra un mensaje claro.
// ===================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getEncuentrosByTorneo } from "../../services/encuentrosService";
import styles from "./EncuentrosJugador.module.css";

export default function EncuentrosJugador() {
  const { id } = useParams(); // ID del torneo (puede venir vacío)
  const [encuentros, setEncuentros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga asíncrona memorizada
  const cargarEncuentros = useCallback(async () => {
    // Si no hay un torneo seleccionado en la URL, no hay nada que
    // pedir al backend. Igual apagamos el loading para no dejar la
    // pantalla congelada.
    if (!id) {
      setEncuentros([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getEncuentrosByTorneo(id);
      setEncuentros(data || []);
    } catch (error) {
      console.error("Error al obtener encuentros para vista jugador:", error);
      setEncuentros([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarEncuentros();
  }, [cargarEncuentros]);

  // Formateador seguro contra nulos
  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return "Por definir";
    try {
      return fechaRaw.split("T")[0].split("-").reverse().join("-");
    } catch (err) {
      return fechaRaw;
    }
  };

  const obtenerEstiloEstado = (estado = "") => {
    switch (estado.toLowerCase()) {
      case "jugando":
        return styles.jugando;
      case "finalizado":
        return styles.finalizado;
      case "aplazado":
        return styles.aplazado;
      default:
        return styles.pendiente;
    }
  };

  // Agrupar los partidos por su número de jornada correspondiente
  const encuentrosPorJornada = encuentros.reduce((acc, encuentro) => {
    const jornada = encuentro.jornada || "Por Definir";
    if (!acc[jornada]) {
      acc[jornada] = [];
    }
    acc[jornada].push(encuentro);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.sinDatosContainer}>
          <p className={styles.sinDatosTexto}>
            Cargando calendario del torneo...
          </p>
        </div>
      </div>
    );
  }

  // No hay torneo seleccionado en la URL
  if (!id) {
    return (
      <div className={styles.container}>
        <h1 className={styles.tituloPrincipal}>Calendario de Encuentros</h1>
        <div className={styles.sinDatosContainer}>
          <p className={styles.sinDatosTexto}>
            Selecciona un torneo desde "Torneos" para ver su calendario de
            encuentros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.tituloPrincipal}>Calendario de Encuentros</h1>

      {encuentros.length === 0 ? (
        <div className={styles.sinDatosContainer}>
          <p className={styles.sinDatosTexto}>
            No hay encuentros programados para este torneo actualmente.
          </p>
        </div>
      ) : (
        Object.entries(encuentrosPorJornada)
          .sort(([a], [b]) => a - b) // Ordenar las jornadas numéricamente
          .map(([jornada, partidos]) => (
            <div className={styles.seccionJornada} key={jornada}>
              <h2 className={styles.tituloJornada}>Jornada {jornada}</h2>

              <div className={styles.listaPartidos}>
                {partidos.map((encuentro) => (
                  <div
                    key={encuentro.id_encuentro}
                    className={styles.encuentroCard}
                  >
                    {/* FECHA Y HORA */}
                    <div className={styles.infoTemporal}>
                      <span className={styles.fecha}>
                        {formatearFecha(encuentro.fecha)}
                      </span>
                      <span className={styles.hora}>
                        {encuentro.hora
                          ? `${encuentro.hora.slice(0, 5)} hrs`
                          : "--:--"}
                      </span>
                    </div>

                    {/* ENFRENTAMIENTO CENTRAL */}
                    <div className={styles.bloqueCentral}>
                      <div className={styles.marcador}>
                        <span className={`${styles.equipo} ${styles.local}`}>
                          {encuentro.equipo_local}
                        </span>
                        <span className={styles.vs}>VS</span>
                        <span
                          className={`${styles.equipo} ${styles.visitante}`}
                        >
                          {encuentro.equipo_visitante}
                        </span>
                      </div>
                      <span className={styles.lugar}>
                        📍 {encuentro.lugar || "Lugar por confirmar"}
                      </span>
                    </div>

                    {/* ESTADO ACTUAL DEL PARTIDO */}
                    <div>
                      <span
                        className={`${styles.estadoBadge} ${obtenerEstiloEstado(
                          encuentro.estado
                        )}`}
                      >
                        {encuentro.estado || "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}