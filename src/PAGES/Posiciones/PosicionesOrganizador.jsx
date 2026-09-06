import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getTablaPosiciones } from "../../services/posicionesService";
import styles from "./PosicionesOrganizador.module.css";

export default function PosicionesOrganizador() {
  const { id } = useParams();
  const [posiciones, setPosiciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🛠️ Optimizamos con useCallback para manejar de forma segura las dependencias en useEffect
  const cargarPosiciones = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const res = await getTablaPosiciones(id);
      setPosiciones(res.data || []);
    } catch (error) {
      console.error("Error cargando posiciones del organizador:", error);
      setPosiciones([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarPosiciones();
  }, [cargarPosiciones]);

  return (
    <div className={styles.container}>
      <div className={styles.tablaWrapper}>
        
        {/* Header con información contextual */}
        <div className={styles.headerTabla}>
          <div>
            <h2 className={styles.titulo}>Tabla de Posiciones</h2>
            {posiciones.length > 0 && (
              <h3 className={styles.subtitulo}>
                Torneo: {posiciones[0]?.nombre_torneo}
              </h3>
            )}
          </div>

          <div>
            <button 
              className={styles.btnActualizar} 
              onClick={cargarPosiciones}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {/* Tabla deportiva de cara al Organizador */}
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.puesto}>#</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th>PTS</th>
            </tr>
          </thead>

          <tbody>
            {posiciones.length > 0 ? (
              posiciones.map((equipo, index) => {
                const puesto = index + 1;
                const esLider = puesto === 1;

                return (
                  <tr 
                    key={equipo.id_equipo}
                    className={esLider ? styles.filaLider : ""}
                  >
                    <td className={styles.puesto}>{puesto}</td>
                    <td className={styles.equipo}>{equipo.nombre_equipo}</td>
                    <td>{equipo.partidos_jugados}</td>
                    <td>{equipo.ganados}</td>
                    <td>{equipo.empatados}</td>
                    <td>{equipo.perdidos}</td>
                    <td>{equipo.goles_favor}</td>
                    <td>{equipo.goles_contra}</td>
                    <td>{equipo.diferencia_gol}</td>
                    <td className={styles.puntos}>
                      {equipo.puntos}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className={styles.cargandoText}>
                  {loading 
                    ? "Procesando tabla general de posiciones..." 
                    : "No hay posiciones registradas para este torneo."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}