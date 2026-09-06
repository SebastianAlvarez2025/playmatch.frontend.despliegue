import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { getTorneoById } from "../../services/torneoService";

import Posiciones from "../Posiciones/Posiciones";
import Resultados from "../Resultados/Resultados";
import Encuentros from "../Encuentros/Encuentros";

import trofeo from "../../ASSETS/trofeo.jpg";
import styles from "./TorneoDetalleJugador.module.css";

export default function TorneoDetalleJugador() {
  const { id } = useParams();

  const [torneo, setTorneo] = useState(null);
  const [tab, setTab] = useState("encuentros");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const torneoData = await getTorneoById(id);

        setTorneo(Array.isArray(torneoData) ? torneoData[0] : torneoData);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el torneo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className={styles.loadingText}>Cargando torneo...</p>;

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (!torneo) {
    return <p className={styles.notFoundText}>No se encontró el torneo</p>;
  }

  return (
    <div className={styles.detalleContainer}>
      <header className={styles.detalleHeader}>
        <h1>{torneo.nombre_torneo}</h1>

        <div className={styles.dataDetalle}>
          <div className={styles.imageContainer}>
            <img src={trofeo} alt="Logo torneo" />
          </div>

          <div className={styles.info}>
            <p>
              <span className={styles.torneoSubtitulo}>Tipo de torneo:</span>{" "}
              {torneo.tipo_torneo}
            </p>

            <p>
              <span className={styles.torneoSubtitulo}>Ciudad:</span> {torneo.ciudad}
            </p>

            <p>
              <span className={styles.torneoSubtitulo}>Estado:</span> {torneo.estado}
            </p>

            <p>
              <span className={styles.torneoSubtitulo}>Fecha de inicio:</span>{" "}
              {new Date(torneo.fecha_inicio).toLocaleDateString()}
            </p>

            <p>
              <span className={styles.torneoSubtitulo}>Fecha de finalización:</span>{" "}
              {new Date(torneo.fecha_fin).toLocaleDateString()}
            </p>
          </div>
        </div>

        <nav className={styles.detalleNav}>
          <button
            className={tab === "posiciones" ? styles.activeTab : ""}
            onClick={() => setTab("posiciones")}
          >
            Posiciones
          </button>

          <button
            className={tab === "encuentros" ? styles.activeTab : ""}
            onClick={() => setTab("encuentros")}
          >
            Encuentros
          </button>

          <button
            className={tab === "resultados" ? styles.activeTab : ""}
            onClick={() => setTab("resultados")}
          >
            Resultados
          </button>
        </nav>
      </header>

      <main className={styles.detalleMain}>
        {tab === "posiciones" && <Posiciones id_torneo={id} />}

        {tab === "encuentros" && <Encuentros id_torneo={id} />}

        {tab === "resultados" && <Resultados id_torneo={id} />}
      </main>
    </div>
  );
}