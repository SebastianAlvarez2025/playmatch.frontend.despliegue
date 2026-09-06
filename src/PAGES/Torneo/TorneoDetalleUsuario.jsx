import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { getTorneoById } from "../../services/torneoService";

import Posiciones from "../Posiciones/Posiciones";
import Resultados from "../Resultados/Resultados";
import Equipos from "../Equipos/Equipos";
import InscripcionesEquipos from "../InscripcionesEquipo/inscripcionesEquipos";
//import Encuentros from "../Encuentros/Encuentros";

import trofeo from "../../ASSETS/trofeo.jpg";
import styles from "./TorneoDetalleUsuario.module.css"; // 👈 Conectado al nuevo CSS modular

export default function TorneoDetalleUsuario() {
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
      {/* HEADER */}
      <header className={styles.detalleHeader}>
        <h1>{torneo.nombre_torneo}</h1>
        <div className={styles.dataDetalle}>
          <div className={styles.imageContainer}>
            <img src={trofeo} alt="Logo" />
          </div>
          <div className={styles.info}>
            <p>
              <span className={styles.torneoSubtitulo}>Tipo De Torneo:</span>{" "}
              {torneo.tipo_torneo}
            </p>
            <p>
              {/* 🛠️ Bug corregido: asignado a ciudad correctamente */}
              <span className={styles.torneoSubtitulo}>Ciudad:</span> {torneo.ciudad}
            </p>
            <p>
              <span className={styles.torneoSubtitulo}>Estado:</span> {torneo.estado}
            </p>
            <p>
              <span className={styles.torneoSubtitulo}>Fecha de Finalización:</span>{" "}
              {new Date(torneo.fecha_fin).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* TABS */}
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

          <button
            className={tab === "equipos" ? styles.activeTab : ""}
            onClick={() => setTab("equipos")}
          >
            Equipos
          </button>

          <button
            className={tab === "inscripciones" ? styles.activeTab : ""}
            onClick={() => setTab("inscripciones")}
          >
            Inscripciones
          </button>
        </nav>
      </header>

      {/* CONTENIDO */}
      <main className={styles.detalleMain}>
        {tab === "posiciones" && <Posiciones id_torneo={id} />}
        {tab === "encuentros" && <Encuentros id_torneo={id} />}
        {tab === "resultados" && <Resultados id_torneo={id} />}
        {tab === "equipos" && <Equipos id_torneo={id} />}
        {tab === "inscripciones" && <InscripcionesEquipos id_torneo={id} />}
      </main>
    </div>
  );
}