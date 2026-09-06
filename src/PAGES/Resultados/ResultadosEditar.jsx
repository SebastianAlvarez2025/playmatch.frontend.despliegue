import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResultadoById, updateResultado } from "../../services/resultadosService";
import styles from "./ResultadosEditar.module.css";

export default function ResultadosEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    id_encuentro: "",
    goles_local: 0,
    goles_visitante: 0,
  });

  // 🛠️ Optimizamos con useCallback para limpiar dependencias del useEffect
  const cargarResultado = useCallback(async () => {
    try {
      setFetching(true);
      const data = await getResultadoById(id);
      
      // Mapeo seguro extrayendo la data cruda que responde la API
      const resultado = data?.data || data;

      if (resultado) {
        setForm({
          id_encuentro: resultado.id_encuentro || "",
          goles_local: resultado.goles_local ?? 0,
          goles_visitante: resultado.goles_visitante ?? 0,
        });
      }
    } catch (error) {
      console.error("Error al recuperar el resultado anterior:", error);
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarResultado();
    }
  }, [id, cargarResultado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 🛠️ Forzamos parseo entero positivo y blindamos contra goles negativos
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Math.max(0, parseInt(value, 10)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateResultado(id, form);
      navigate("/resultados");
    } catch (error) {
      console.error("Error al actualizar el resultado:", error);
      alert("No se pudo actualizar el marcador en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className={styles.container}><p>Cargando información del partido...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.titulo}>Modificar Marcador</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Campo ID Encuentro bloqueado por integridad referencial */}
          <div className={styles.grupoInput}>
            <label className={styles.label}>ID del Encuentro (No editable)</label>
            <input
              className={`${styles.input} ${styles.inputDisabled}`}
              type="number"
              name="id_encuentro"
              value={form.id_encuentro}
              disabled
              required
            />
          </div>

          {/* Fila del Marcador */}
          <div className={styles.marcadorFila}>
            <div className={styles.grupoInput}>
              <label className={styles.label}>Goles Local</label>
              <input
                className={styles.input}
                type="number"
                name="goles_local"
                min="0"
                value={form.goles_local}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.grupoInput}>
              <label className={styles.label}>Goles Visitante</label>
              <input
                className={styles.input}
                type="number"
                name="goles_visitante"
                min="0"
                value={form.goles_visitante}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Grupo de acciones */}
          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnSubmit}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Marcador"}
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancelar}`}
              onClick={() => navigate("/resultados")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}