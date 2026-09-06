import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CategoriasAdmin.module.css";

const API = import.meta.env.VITE_API_URL + "/categorias";

export default function CategoriasEditar() {
  const { id_categoria } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_categoria: "",
    edad_minima: "",
    edad_maxima: "",
    activo: 1,
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerCategoria = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API}/${id_categoria}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información de la categoría.");
        }
        const data = await response.json();
        const categoriaData = data?.data || data;

        setFormData({
          nombre_categoria: categoriaData.nombre_categoria || "",
          edad_minima: categoriaData.edad_minima ?? "",
          edad_maxima: categoriaData.edad_maxima ?? "",
          activo: categoriaData.activo === 1 || categoriaData.activo === true ? 1 : 0,
        });
      } catch (err) {
        console.error("Error al obtener categoría:", err);
        alert(err.message || "Error al cargar los datos de la categoría.");
      } finally {
        setCargando(false);
      }
    };

    if (id_categoria) {
      obtenerCategoria();
    }
  }, [id_categoria]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.edad_minima) > Number(formData.edad_maxima)) {
      alert("La edad mínima no puede ser mayor que la edad máxima.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/${id_categoria}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          nombre_categoria: formData.nombre_categoria.trim(),
          edad_minima: Number(formData.edad_minima),
          edad_maxima: Number(formData.edad_maxima),
          activo: formData.activo,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Error al actualizar la categoría.");
      }

      // Mensaje dinámico según el estado seleccionado
      const mensajeAccion =
        formData.activo === 1
          ? "¡La categoría se activó y actualizó exitosamente!"
          : "¡La categoría se desactivó y actualizó exitosamente!";

      alert(mensajeAccion);
      navigate("/categorias");
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert(err.message || "Ocurrió un error al guardar los cambios.");
    }
  };

  if (cargando) {
    return (
      <div className={styles.torneosContainer}>
        <p style={{ color: "#ffffff" }}>Cargando datos de la categoría...</p>
      </div>
    );
  }

  return (
    <div className={styles.torneosContainer}>
      <div className={styles.tablaContainer} style={{ maxWidth: "600px" }}>
        <div className={styles.torneosHeader}>
          <h2 className={styles.titulo}>Editar Categoría</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="nombre_categoria">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              id="nombre_categoria"
              name="nombre_categoria"
              className={styles.formInput}
              value={formData.nombre_categoria}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel} htmlFor="edad_minima">
                Edad Mínima *
              </label>
              <input
                type="number"
                id="edad_minima"
                name="edad_minima"
                className={styles.formInput}
                value={formData.edad_minima}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel} htmlFor="edad_maxima">
                Edad Máxima *
              </label>
              <input
                type="number"
                id="edad_maxima"
                name="edad_maxima"
                className={styles.formInput}
                value={formData.edad_maxima}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formCheckboxContainer}>
            <input
              type="checkbox"
              id="activo"
              name="activo"
              className={styles.formCheckbox}
              checked={formData.activo === 1}
              onChange={handleChange}
            />
            <label htmlFor="activo" className={styles.formCheckboxLabel}>
              {formData.activo === 1 ? "Estado: Activo" : "Estado: Desactivar"}
            </label>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.eliminar}`}
              onClick={() => navigate("/categorias")}
            >
              Cancelar
            </button>
            <button type="submit" className={`${styles.btn} ${styles.crear}`}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}