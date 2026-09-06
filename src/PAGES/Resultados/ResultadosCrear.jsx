import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createResultado } from "../../services/resultadosService";
import styles from "./ResultadosCrear.module.css";

export default function ResultadosCrear() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_encuentro: "",
    goles_local: 0,
    goles_visitante: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 🛠️ Garantizamos que los valores se guarden como números enteros y nunca sean negativos
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Math.max(0, parseInt(value, 10)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createResultado(form);
      navigate("/resultados");
    } catch (error) {
      console.error("Error al registrar el resultado:", error);
      alert("Hubo un error al guardar el marcador. Verifica el ID del encuentro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.titulo}>Registrar Marcador</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Campo ID Encuentro */}
          <div className={styles.grupoInput}>
            <label className={styles.label}>ID del Encuentro Deportivo</label>
            <input
              className={styles.input}
              type="number"
              name="id_encuentro"
              placeholder="Ej: 42"
              min="1"
              value={form.id_encuentro}
              onChange={handleChange}
              required
            />
          </div>

          {/* Fila del Marcador Fijo */}
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
              {loading ? "Guardando..." : "Guardar Marcador"}
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