import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteEncuentro, getEncuentroById } from "../../services/encuentrosService";
import styles from "./EncuentrosEliminar.module.css";

export default function EncuentrosEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [encuentro, setEncuentro] = useState(null);
  const [errorLocal, setErrorLocal] = useState("");

  // Cargar datos del encuentro para validar su estado
  useEffect(() => {
    if (!id) return;

    const cargarEncuentro = async () => {
      try {
        setLoadingInfo(true);
        const data = await getEncuentroById(id);
        const info = data?.data || data;
        setEncuentro(info);

        // Si el estado es "Jugando", se notifica de inmediato
        if (info?.estado?.toLowerCase() === "jugando") {
          setErrorLocal("No se puede desactivar un encuentro que se encuentra en estado 'Jugando'.");
        }
      } catch (error) {
        console.error("Error al obtener el encuentro:", error);
        setErrorLocal("No se pudo obtener la información del encuentro.");
      } finally {
        setLoadingInfo(false);
      }
    };

    cargarEncuentro();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    // Bloqueo preventivo en el handler
    if (encuentro?.estado?.toLowerCase() === "jugando") {
      setErrorLocal("No es posible eliminar partidos en juego.");
      return;
    }

    try {
      setLoading(true);
      setErrorLocal("");
      await deleteEncuentro(id);

      // Redirección al panel principal de encuentros
      const idTorneo = encuentro?.id_torneo;
      navigate(idTorneo ? `/encuentros/${idTorneo}` : "/encuentros");
    } catch (error) {
      console.error("Error al eliminar el encuentro:", error);
      setErrorLocal(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo eliminar el encuentro. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.alertaCard}>
          <p>Cargando información del encuentro...</p>
        </div>
      </div>
    );
  }

  const esJugando = encuentro?.estado?.toLowerCase() === "jugando";

  return (
    <div className={styles.container}>
      <div className={styles.alertaCard}>
        <span className={styles.iconoAdvertencia} role="img" aria-label="Advertencia">
          ⚠️
        </span>

        <h2 className={styles.titulo}>¿Deseas desactivar este encuentro?</h2>

        {errorLocal && <p className={styles.errorText}>{errorLocal}</p>}

        <div className={styles.acciones}>
          <button
            className={`${styles.btn} ${styles.btnCancelar}`}
            onClick={() =>
              navigate(
                encuentro?.id_torneo ? `/encuentros/${encuentro.id_torneo}` : "/encuentros"
              )
            }
            disabled={loading}
          >
            Volver
          </button>

          <button
            className={`${styles.btn} ${styles.btnEliminar}`}
            onClick={handleDelete}
            disabled={loading || esJugando}
          >
            {loading ? "Desactivando..." : "Sí, desactivar encuentro"}
          </button>
        </div>
      </div>
    </div>
  );
}