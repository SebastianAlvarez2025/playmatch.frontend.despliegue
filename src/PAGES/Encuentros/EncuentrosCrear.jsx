import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEncuentro } from "../../services/encuentrosService";
import { getEquiposByTorneo } from "../../services/equiposService";
import styles from "./EncuentrosCrear.module.css";

export default function EncuentrosCrear() {
  const navigate = useNavigate();
  const { id_torneo } = useParams();

  const [equipos, setEquipos] = useState([]);
  const [loadingEquipos, setLoadingEquipos] = useState(true);

  const [form, setForm] = useState({
    id_torneo: id_torneo ? Number(id_torneo) : "",
    id_equipo_local: "",
    id_equipo_visitante: "",
    jornada: "",
    lugar: "",
    fecha: "",
    hora: "",
    estado: "Pendiente",
  });

  const [errorLocal, setErrorLocal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cargar los equipos vinculados a este torneo
  useEffect(() => {
    if (!id_torneo) return;

    const cargarEquipos = async () => {
      try {
        setLoadingEquipos(true);

        const data = await getEquiposByTorneo(id_torneo);

        const listaEquipos = data?.data || data || [];

        setEquipos(listaEquipos);
      } catch (err) {
        console.error("Error al cargar equipos:", err);
        setErrorLocal("No se pudieron cargar los equipos del torneo.");
      } finally {
        setLoadingEquipos(false);
      }
    };

    cargarEquipos();
    setForm((prev) => ({ ...prev, id_torneo: Number(id_torneo) }));
  }, [id_torneo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "id_equipo_local" || name === "id_equipo_visitante") {
      setErrorLocal("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos de selección requeridos
    if (!form.id_equipo_local || !form.id_equipo_visitante) {
      setErrorLocal("Debes seleccionar ambos equipos.");
      return;
    }

    // Validación de equipos duplicados
    if (String(form.id_equipo_local) === String(form.id_equipo_visitante)) {
      setErrorLocal("El equipo local y el visitante no pueden ser el mismo.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorLocal("");

      // Formatear payload convirtiendo valores a numéricos puros
      const payload = {
        ...form,
        id_torneo: Number(form.id_torneo),
        id_equipo_local: Number(form.id_equipo_local),
        id_equipo_visitante: Number(form.id_equipo_visitante),
        jornada: Number(form.jornada),
      };

      await createEncuentro(payload);

      // Redireccionar a la vista general de encuentros del torneo
      navigate(-1);
    } catch (error) {
      console.error("Error al registrar el encuentro manual:", error);
      setErrorLocal(
        error.response?.data?.message ||
          "Ocurrió un error en el servidor al guardar el encuentro.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEquipos) {
    return (
      <div className={styles.spinnerContainer}>
        <p>Cargando lista de equipos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formularioCard}>
        <h2 className={styles.titulo}>Crear Encuentro</h2>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          {/* TORNEO */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>ID Torneo</label>
            <input
              className={`${styles.input} ${styles.inputDisabled}`}
              value={form.id_torneo}
              disabled
            />
          </div>

          {/* EQUIPO LOCAL */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Equipo Local *</label>
            <select
              id="equipo_local"
              className={styles.select}
              name="id_equipo_local"
              value={form.id_equipo_local || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona Equipo Local --</option>
              {equipos.map((eq) => {
                const idVal = eq.id_equipo || eq.id_inscripcion_e;
                return (
                  <option key={idVal} value={idVal}>
                    {eq.nombre_equipo}
                  </option>
                );
              })}
            </select>
          </div>

          {/* EQUIPO VISITANTE */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Equipo Visitante *</label>
            <select
              id="equipo_visitante"
              className={styles.select}
              name="id_equipo_visitante"
              value={form.id_equipo_visitante || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona Equipo Visitante --</option>
              {equipos.map((eq) => {
                const idVal = eq.id_equipo || eq.id_inscripcion_e;
                return (
                  <option key={idVal} value={idVal}>
                    {eq.nombre_equipo}
                  </option>
                );
              })}
            </select>
          </div>

          {/* JORNADA */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Número de Jornada *</label>
            <input
              id="jornada"
              className={styles.input}
              type="number"
              name="jornada"
              min="1"
              value={form.jornada}
              onChange={handleChange}
              placeholder="Ej. 1"
              required
            />
          </div>

          {/* LUGAR */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Lugar / Cancha *</label>
            <input
              id="lugar"
              className={styles.input}
              type="text"
              name="lugar"
              value={form.lugar}
              onChange={handleChange}
              placeholder="Ej. Cancha Principal"
              required
            />
          </div>

          {/* FECHA */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Fecha del Partido *</label>
            <input
              id="fecha_encuentro"
              className={styles.input}
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
            />
          </div>

          {/* HORA */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Hora de Inicio *</label>
            <input
              id="hora_encuentro"
              className={styles.input}
              type="time"
              name="hora"
              value={form.hora}
              onChange={handleChange}
              required
            />
          </div>

          {/* ESTADO */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Estado Inicial</label>
            <select
              id="estadoInicial"
              className={styles.select}
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Jugando">Jugando</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Aplazado">Aplazado</option>
            </select>
          </div>

          {errorLocal && <p className={styles.errorText}>{errorLocal}</p>}

          {/* BOTONES */}
          <div className={styles.contenedorBotones}>
            <button
              className={`${styles.btn} ${styles.btnCancelar}`}
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              className={`${styles.btn} ${styles.btnSubmit}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Registrar Encuentro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
