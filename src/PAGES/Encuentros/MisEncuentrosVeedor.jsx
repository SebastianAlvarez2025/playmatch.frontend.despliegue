import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEncuentrosByVeedor } from "../../services/encuentrosService";

import styles from "./EncuentrosOrganizador.module.css";

export default function MisEncuentros() {
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEncuentros();
  }, []);

  const cargarEncuentros = async () => {
    try {
      setLoading(true);

      const data = await getEncuentrosByVeedor();

      const encuentrosPendientes = (data || []).filter((encuentro) => {
        const estado = (encuentro.estado || "").toLowerCase();

        return estado === "pendiente" || estado === "jugando";
      });

      setEncuentros(encuentrosPendientes);
    } catch (error) {
      console.error("Error al cargar mis encuentros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return "Por definir";

    return fechaRaw.split("T")[0].split("-").reverse().join("-");
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

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando mis encuentros...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerTabla}>
        <div>
          <h1>Mis Encuentros</h1>
          <p>Encuentros asignados</p>
        </div>
      </div>

      {encuentros.length === 0 ? (
        <div className={styles.sinDatos}>
          <p>No tienes encuentros asignados actualmente.</p>
        </div>
      ) : (
        <div className={styles.listaPartidos}>
          {encuentros.map((encuentro) => (
            <div
              key={encuentro.id_encuentro}
              className={styles.encuentroCard}
              onClick={() => navigate(`/cronologias/${encuentro.id_encuentro}`)}
              style={{ cursor: "pointer" }}
            >
              {/* FECHA */}

              <div className={styles.fecha}>
                📅 {formatearFecha(encuentro.fecha)}
              </div>

              {/* PARTIDO */}

              <div className={styles.infoPartido}>
                <div className={styles.marcador}>
                  <span className={styles.equipo}>
                    {encuentro.equipo_local}
                  </span>

                  <span className={styles.vs}>vs</span>

                  <span className={styles.equipo}>
                    {encuentro.equipo_visitante}
                  </span>
                </div>

                <span className={styles.lugar}>
                  📍 {encuentro.lugar || "Sin cancha"}
                </span>
              </div>

              {/* HORA */}

              <div className={styles.hora}>
                ⏰ {encuentro.hora ? encuentro.hora.slice(0, 5) : "--:--"}
              </div>

              {/* ESTADO */}

              <div>
                <span
                  className={`${styles.estadoBadge} ${obtenerEstiloEstado(
                    encuentro.estado,
                  )}`}
                >
                  {encuentro.estado || "Pendiente"}
                </span>
              </div>

              {/* VEEDOR */}

              <div className={styles.asignacionVeedor}>👁️ Veedor</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
