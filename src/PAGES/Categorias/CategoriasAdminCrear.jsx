import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoriasAdmin.module.css";

const API = import.meta.env.VITE_API_URL + "/categorias";

const CategoriasCrear = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_categoria: "",
    edad_minima: "",
    edad_maxima: "",
  });

  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    if (
      !formData.nombre_categoria.trim() ||
      formData.edad_minima === "" ||
      formData.edad_maxima === ""
    ) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    if (Number(formData.edad_minima) > Number(formData.edad_maxima)) {
      setError("La edad mínima no puede ser mayor que la edad máxima.");
      return;
    }

    try {
      setCargando(true);
      const token = localStorage.getItem("token");

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          nombre_categoria: formData.nombre_categoria.trim(),
          edad_minima: Number(formData.edad_minima),
          edad_maxima: Number(formData.edad_maxima),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la categoría.");
      }

      setMensajeExito("¡Categoría registrada exitosamente!");

      setTimeout(() => {
        navigate("/categorias");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.torneosContainer}>
      <div className={styles.tablaContainer} style={{ maxWidth: "600px" }}>
        <div className={styles.torneosHeader}>
          <h2 className={styles.titulo}>Crear Nueva Categoría</h2>
        </div>

        {error && <div className={styles.mensajeError}>{error}</div>}
        {mensajeExito && <div className={styles.mensajeExito}>{mensajeExito}</div>}

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
              placeholder="Ej: Sub-17, Mayor, Veteranos"
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
                placeholder="Ej: 15"
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
                placeholder="Ej: 17"
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.eliminar}`}
              onClick={() => navigate("/categorias")}
              disabled={cargando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`${styles.btn} ${styles.crear}`}
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Guardar Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriasCrear;