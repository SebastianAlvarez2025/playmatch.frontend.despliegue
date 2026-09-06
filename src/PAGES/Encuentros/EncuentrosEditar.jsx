import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEncuentroById,
  updateEncuentro,
} from "../../services/encuentrosService";

import styles from "./EncuentrosEditar.module.css";

export default function EncuentrosEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // ESTADO DEL FORMULARIO
  // ============================================================

  const [formData, setFormData] = useState({
    id_torneo: "",
    id_equipo_local: "",
    equipo_local: "",
    id_equipo_visitante: "",
    equipo_visitante: "",
    jornada: "",
    lugar: "",
    fecha: "",
    hora: "",
    estado: "Pendiente",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // CARGAR ENCUENTRO
  // ============================================================
  useEffect(() => {
    const cargarEncuentro = async () => {
      if (!id) {
        setError("No se encontró el ID del encuentro.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEncuentroById(id);

        if (!data) {
          setError("No se encontró el encuentro.");
          return;
        }

        setFormData({
          id_torneo: data.id_torneo ?? "",
          id_equipo_local: data.id_equipo_local ?? "",

          // Verifica varias combinaciones comunes de nombres o estructuras anidadas
          equipo_local:
            data.equipo_local ||
            data.nombre_equipo_local ||
            data.equipoLocal?.nombre_equipo ||
            data.equipoLocal ||
            "",

          id_equipo_visitante: data.id_equipo_visitante ?? "",

          equipo_visitante:
            data.equipo_visitante ||
            data.nombre_equipo_visitante ||
            data.equipoVisitante?.nombre_equipo ||
            data.equipoVisitante ||
            "",

          jornada:
            data.jornada !== null && data.jornada !== undefined
              ? String(data.jornada)
              : "",

          lugar: data.lugar ?? "",
          fecha: data.fecha ? String(data.fecha).split("T")[0] : "",
          hora: data.hora ? String(data.hora).slice(0, 5) : "",
          estado: data.estado ?? "Pendiente",
        });
      } catch (err) {
        console.error("Error al cargar encuentro:", err);
        setError(
          err?.message || "No se pudo cargar la información del encuentro.",
        );
      } finally {
        setLoading(false);
      }
    };

    cargarEncuentro();
  }, [id]);
  // ============================================================
  // CAMBIAR CAMPOS
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // ACTUALIZAR ENCUENTRO
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setError("No se encontró el ID del encuentro.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // ========================================================
      // VALIDACIONES
      // ========================================================

      if (!formData.jornada) {
        setError("La jornada es obligatoria.");
        return;
      }

      if (!formData.lugar.trim()) {
        setError("El lugar o cancha es obligatorio.");
        return;
      }

      if (!formData.fecha) {
        setError("La fecha es obligatoria.");
        return;
      }

      if (!formData.hora) {
        setError("La hora es obligatoria.");
        return;
      }

      if (!formData.estado) {
        setError("El estado del encuentro es obligatorio.");
        return;
      }

      // ========================================================
      // DATOS QUE SE ENVÍAN AL BACKEND
      // ========================================================

      const datosActualizar = {
        id_torneo: formData.id_torneo,
        id_equipo_local: formData.id_equipo_local,
        id_equipo_visitante: formData.id_equipo_visitante,

        jornada: Number(formData.jornada),

        lugar: formData.lugar.trim(),

        fecha: formData.fecha,

        // MySQL acepta HH:mm:ss
        hora:
          formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora,

        // IMPORTANTE:
        // aquí se envía exactamente el estado
        // seleccionado en el <select>
        estado: formData.estado,
      };

      const respuesta = await updateEncuentro(id, datosActualizar);

      alert(respuesta?.message || "Encuentro actualizado correctamente.");

      // ========================================================
      // VOLVER A LA LISTA DE ENCUENTROS DEL TORNEO
      // ========================================================

      navigate(-1);
    } catch (err) {
      console.error("Error al actualizar encuentro:", err);

      setError(err?.message || "Ocurrió un error al guardar los cambios.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // CARGANDO
  // ============================================================

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <p>Cargando información del encuentro...</p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={styles.container}>
      <div className={styles.formularioCard}>
        <h2 className={styles.titulo}>Editar Encuentro</h2>

        {/* ERROR */}

        {error && <p className={styles.errorText}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* ==================================================
              EQUIPO LOCAL
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Equipo Local</label>

            <input
              type="text"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={formData.equipo_local}
              disabled
            />
          </div>

          {/* ==================================================
              EQUIPO VISITANTE
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Equipo Visitante</label>

            <input
              type="text"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={formData.equipo_visitante}
              disabled
            />
          </div>

          {/* ==================================================
              JORNADA
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Jornada</label>

            <input
              type="number"
              name="jornada"
              min="1"
              className={styles.input}
              value={formData.jornada}
              onChange={handleChange}
              required
            />
          </div>

          {/* ==================================================
              LUGAR
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Lugar / Cancha</label>

            <input
              type="text"
              name="lugar"
              className={styles.input}
              value={formData.lugar}
              onChange={handleChange}
              placeholder="Ej: Cancha Principal"
              required
            />
          </div>

          {/* ==================================================
              FECHA
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Fecha</label>

            <input
              type="date"
              name="fecha"
              className={styles.input}
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          {/* ==================================================
              HORA
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Hora</label>

            <input
              type="time"
              name="hora"
              className={styles.input}
              value={formData.hora}
              onChange={handleChange}
              required
            />
          </div>

          {/* ==================================================
              ESTADO
          ================================================== */}

          <div className={styles.grupoCampo}>
            <label className={styles.label}>Estado del Partido</label>

            <select
              name="estado"
              className={styles.select}
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="Pendiente">Pendiente</option>

              <option value="Jugando">Jugando</option>

              <option value="Finalizado">Finalizado</option>

              <option value="Suspendido">Suspendido</option>

              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* ==================================================
              BOTONES
          ================================================== */}

          <div className={styles.contenedorBotones}>
            {/* GUARDAR */}

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar Cambios"}
            </button>

            {/* CANCELAR */}

            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancelar}`}
              onClick={() => {
                if (submitting) return;

                navigate(-1);
              }}
              disabled={submitting}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
