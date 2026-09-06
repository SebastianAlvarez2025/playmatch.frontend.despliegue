import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEncuentroById,
  updateEncuentro,
} from "../../services/encuentrosService";
import styles from "./EncuentrosEditar.module.css";

export default function EncuentroReprogramar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_torneo: null,
    id_equipo_local: "",
    id_equipo_visitante: "",
    nombre_local: "",
    nombre_visitante: "",
    jornada: "",
    lugar: "",
    fecha: "",
    hora: "",
    estado: "Pendiente",
  });

  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState("");

  const estadosDisponibles = [
    "Pendiente",
    "Jugando",
    "Finalizado",
    "Suspendido",
    "Cancelado",
  ];

  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      try {
        const response = await getEncuentroById(id);
        const data = response?.data || response;

        if (data) {
          // Normalización para seleccionar la opción correcta en el select
          const estadoGuardado = data?.estado ? String(data.estado).trim() : "Pendiente";
          const estadoCoincidente = estadosDisponibles.find(
            (e) => e.toLowerCase() === estadoGuardado.toLowerCase()
          );

          setForm({
            id_torneo: data?.id_torneo ?? null,
            id_equipo_local: data?.id_equipo_local ?? "",
            id_equipo_visitante: data?.id_equipo_visitante ?? "",
            nombre_local: data?.equipo_local ?? `Equipo ${data?.id_equipo_local}`,
            nombre_visitante: data?.equipo_visitante ?? `Equipo ${data?.id_equipo_visitante}`,
            jornada: data?.jornada ?? "",
            lugar: data?.lugar ?? "",
            fecha: data?.fecha ? data.fecha.split("T")[0] : "",
            hora: data?.hora ?? "",
            estado: estadoCoincidente || estadoGuardado || "Pendiente",
          });
        }
      } catch (error) {
        console.error("Error al obtener detalles del encuentro:", error);
        setErrorLocal("No se pudo obtener la información del encuentro.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.lugar || !form.fecha || !form.hora || !form.estado) {
      setErrorLocal("Debes completar lugar, fecha, hora y estado.");
      return;
    }

    try {
      await updateEncuentro(id, form);
      alert("Encuentro reprogramado correctamente.");
      navigate("/torneos/mios");
    } catch (error) {
      console.error("Error al reprogramar el encuentro:", error);
      setErrorLocal("Ocurrió un error al guardar los cambios.");
    }
  };

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <p>Cargando datos del encuentro...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formularioCard}>
        <h2 className={styles.titulo}>Editar Encuentro</h2>

        {/* Informante visual de datos del enfrentamiento */}
        <div className={styles.infoEncabezado}>
          <p>
            <strong>Enfrentamiento:</strong> {form.nombre_local} vs {form.nombre_visitante}
          </p>
          <p>
            <strong>Jornada:</strong> {form.jornada}
          </p>
        </div>

        {errorLocal && <p className={styles.errorText}>{errorLocal}</p>}

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          {/* LUGAR */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Lugar / Cancha *</label>
            <input
              className={styles.input}
              type="text"
              name="lugar"
              value={form.lugar}
              onChange={handleChange}
              required
            />
          </div>

          {/* FECHA */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Fecha *</label>
            <input
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
            <label className={styles.label}>Hora *</label>
            <input
              className={styles.input}
              type="time"
              name="hora"
              value={form.hora}
              onChange={handleChange}
              required
            />
          </div>

          {/* ESTADO (SELECT) */}
          <div className={styles.grupoCampo}>
            <label className={styles.label}>Estado del Partido *</label>
            <select
              className={styles.select}
              name="estado"
              value={form.estado}
              onChange={handleChange}
              required
            >
              {estadosDisponibles.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          {/* BOTONES */}
          <div className={styles.contenedorBotones}>
            <button
              className={`${styles.btn} ${styles.btnCancelar}`}
              type="button"
              onClick={() => navigate("/torneos/mios")}
            >
              Cancelar
            </button>
            <button
              className={`${styles.btn} ${styles.btnSubmit}`}
              type="submit"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}