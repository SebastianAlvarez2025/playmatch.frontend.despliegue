import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteResultado, getResultadoById } from "../../services/resultadosService";
import styles from "./ResultadosEliminar.module.css";

export default function ResultadosEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [resultado, setResultado] = useState(null);

  // Traemos los detalles del marcador para mostrar qué se va a eliminar
  const cargarResultado = useCallback(async () => {
    try {
      setFetching(true);
      const data = await getResultadoById(id);
      const resData = data?.data || data;
      setResultado(resData);
    } catch (error) {
      console.error("Error al cargar marcador para eliminar:", error);
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarResultado();
    }
  }, [id, cargarResultado]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteResultado(id);
      navigate("/resultados");
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      alert("No se pudo eliminar el marcador. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className={styles.container}><p>Cargando datos del marcador...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Ícono visual de alerta */}
        <div className={styles.iconoAdvertencia}>⚠️</div>
        
        <h2 className={styles.titulo}>¿Eliminar este resultado?</h2>
        <p className={styles.subtitulo}>
          Esta acción es permanente y no se podrá recuperar la información del marcador deportivo.
        </p>

        {/* Resumen del partido que se borrará */}
        {resultado && (
          <div className={styles.resumenPartido}>
            <div className={styles.infoId}>Encuentro ID: #{resultado.id_encuentro}</div>
            <div className={styles.marcadorBox}>
              <span>Local</span>
              <span className={styles.goles}>{resultado.goles_local}</span>
              <span className={styles.vs}>vs</span>
              <span className={styles.goles}>{resultado.goles_visitante}</span>
              <span>Visitante</span>
            </div>
          </div>
        )}

        {/* Botonera de acciones */}
        <div className={styles.actions}>
          <button 
            className={`${styles.btn} ${styles.btnDelete}`} 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Sí, eliminar definitivamente"}
          </button>

          <button 
            type="button"
            className={`${styles.btn} ${styles.btnCancelar}`} 
            onClick={() => navigate("/resultados")}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}