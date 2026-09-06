import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TorneoCrear.module.css";

export default function TorneoCrear() {
  const navigate = useNavigate();

  // Estados para las categorías de la base de datos
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Estado único del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    categoria_id: "",
    tipo_torneo: "",
    ciudad: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [error, setError] = useState("");

  // 1. Cargar categorías de la base de datos al montar el componente
  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const URL = `${import.meta.env.VITE_API_URL}/categorias/activas`;

        const res = await fetch(URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error en la respuesta del servidor");

        const data = await res.json();
        setCategorias(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las categorías de la base de datos.");
      } finally {
        setLoadingCategorias(false);
      }
    };

    obtenerCategorias();
  }, []);

  // 2. MANEJADOR DE CAMBIOS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 3. Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones de campos vacíos
    if (
      !formData.nombre ||
      !formData.categoria_id ||
      !formData.tipo_torneo ||
      !formData.ciudad ||
      !formData.fechaInicio ||
      !formData.fechaFin
    ) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No se encontró una sesión activa. Por favor, inicia sesión.");
      return;
    }

    console.log("Revisando categoria_id antes de enviar:", formData.categoria_id);

    // Estructuramos los datos para MySQL con id_usuario
    const datosParaBackend = {
      id_usuario: 17,
      nombre_torneo: formData.nombre,
      id_categoria: parseInt(formData.categoria_id, 10),
      tipo_torneo: formData.tipo_torneo,
      ciudad: formData.ciudad,
      fecha_inicio: formData.fechaInicio,
      fecha_fin: formData.fechaFin,
    };

    try {
      const URL = `${import.meta.env.VITE_API_URL}/torneos`;

      const res = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosParaBackend),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear el torneo");
      }

      alert("¡Torneo creado exitosamente! 🏆");
      navigate("/torneos/mios");
    } catch (err) {
      console.error(err.message);
      setError(err.message || "No se pudo crear el torneo");
    }
  };

  // 4. Redirigir al cancelar
  const handleCancelar = () => {
    navigate("/torneos/mios");
  };

  return (
    <div className={styles.crearContainer}>
      <div className={styles.formCard}>
        <h2 className={styles.titulo}>Crear Nuevo Torneo</h2>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <form className={styles.formTorneo} onSubmit={handleSubmit}>
          {/* Nombre del Torneo */}
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Nombre del Torneo *</label>
            <input
              id="nombre_torneo"
              type="text"
              name="nombre"
              className={styles.formInput}
              placeholder="Ej. Copa de Campeones Tigres"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Ciudad */}
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Ciudad *</label>
            <input
              id="nombre_ciudad"
              type="text"
              name="ciudad"
              className={styles.formInput}
              placeholder="Ej. Bogotá"
              value={formData.ciudad}
              onChange={handleChange}
            />
          </div>

          {/* Categoría */}
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Categoría*</label>
            <select
              id= "categoria"
              name="categoria_id"
              className={styles.formSelect}
              value={formData.categoria_id}
              onChange={handleChange}
              disabled={loadingCategorias}
            >
              <option value="">
                {loadingCategorias
                  ? "Cargando categorías..."
                  : "Selecciona una categoría..."}
              </option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de torneo */}
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Tipo de torneo *</label>
            <select
              id= "tipo_torneo"
              name="tipo_torneo"
              className={styles.formSelect}
              value={formData.tipo_torneo}
              onChange={handleChange}
            >
              <option value="">Selecciona...</option>
              <option value="Liga">Liga</option>
              <option value="Grupos">Grupos</option>
              <option value="Eliminacion Directa">Eliminación Directa</option>
            </select>
          </div>

          {/* Fecha de Inicio */}
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Fecha de Inicio *</label>
            <input
              id="fecha_inicio"
              type="date"
              name="fechaInicio"
              className={styles.formInput}
              value={formData.fechaInicio}
              onChange={handleChange}
            />
          </div>

          {/* Fecha de Finalización */}
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Fecha de Finalización *</label>
            <input
              id="fecha_fin"
              type="date"
              name="fechaFin"
              className={styles.formInput}
              value={formData.fechaFin}
              onChange={handleChange}
            />
          </div>

          {/* Botones */}
          <div className={styles.actionsContainer}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={handleCancelar}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit}>
              Crear Torneo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}