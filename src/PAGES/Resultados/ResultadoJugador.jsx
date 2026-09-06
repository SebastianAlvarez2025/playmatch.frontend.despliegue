import { useEffect, useState } from "react";
import { getResultados } from "../../services/resultadosService";
import Pagination from "../../components/Pagination";
import styles from "./ResultadoJugador.module.css";

export default function ResultadoJugador() {
  const [resultados, setResultados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6; // Ajustado a 6 para encajar perfecto en cuadrícula de 2x3 o 3x2

  const cargarResultados = async () => {
    try {
      const data = await getResultados();
      const lista = data?.data || data || [];
      setResultados(lista);
    } catch (error) {
      console.error("Error cargando resultados para jugadores:", error);
    }
  };

  useEffect(() => {
    cargarResultados();
  }, []);

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const resultadosPaginados = resultados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Tablero de Resultados</h2>
      <p className={styles.subtitulo}>Consulta los marcadores finales de los últimos encuentros del torneo.</p>

      <div className={styles.grid}>
        {resultados.length > 0 ? (
          resultadosPaginados.map((r) => (
            <div key={r.id_resultado} className={styles.card}>
              <span className={styles.encuentroBadge}>
                Encuentro #{r.id_encuentro}
              </span>

              <div className={styles.partidoContainer}>
                {/* Bloque Equipo Local */}
                <div className={styles.bando}>
                  <span className={styles.nombreEquipo}>{r.equipo_local}</span>
                </div>

                {/* Marcador Central */}
                <div className={styles.vsContainer}>
                  <span className={styles.vsText}>VS</span>
                  <div className={styles.marcadorBox}>
                    <span>{r.goles_local}</span>
                    <span>-</span>
                    <span>{r.goles_visitante}</span>
                  </div>
                </div>

                {/* Bloque Equipo Visitante */}
                <div className={styles.bando}>
                  <span className={styles.nombreEquipo}>{r.equipo_visitante}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>
            No hay marcadores disponibles en este momento. ¡Vuelve pronto!
          </div>
        )}
      </div>

      <Pagination
        totalRegistros={resultados.length}
        registrosPorPagina={registrosPorPagina}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
      />
    </div>
  );
}