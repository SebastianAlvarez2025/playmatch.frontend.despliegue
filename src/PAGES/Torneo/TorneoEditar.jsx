import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./TorneoEditar.module.css";

const API_TORNEOS = import.meta.env.VITE_API_URL + "/torneos";
const API_CATEGORIAS = import.meta.env.VITE_API_URL + "/categorias/activas";

export default function TorneoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nombre_torneo: "",
    id_categoria: "",
    tipo_torneo: "",
    ciudad: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "Inscripciones Abiertas",
  });

  const [estadoInicial, setEstadoInicial] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [resTorneo, resCategorias] = await Promise.all([
          fetch(`${API_TORNEOS}/${id}`, { headers }),
          fetch(API_CATEGORIAS, { headers }),
        ]);

        if (!resTorneo.ok) throw new Error("Error al obtener los datos del torneo");

        const dataTorneo = await resTorneo.json();
        const torneo = dataTorneo?.data || dataTorneo;

        if (resCategorias.ok) {
          const dataCategorias = await resCategorias.json();
          setCategorias(dataCategorias?.data || dataCategorias || []);
        }

        const estadoActual = torneo.estado || "Inscripciones Abiertas";
        setEstadoInicial(estadoActual);

        setFormData({
          nombre_torneo: torneo.nombre_torneo || "",
          id_categoria: torneo.id_categoria || "",
          tipo_torneo: torneo.tipo_torneo || "",
          ciudad: torneo.ciudad || "",
          fecha_inicio: torneo.fecha_inicio ? torneo.fecha_inicio.split("T")[0] : "",
          fecha_fin: torneo.fecha_fin ? torneo.fecha_fin.split("T")[0] : "",
          estado: estadoActual,
        });

        // Si el torneo ya finalizó, deshabilitamos la edición general
        if (estadoActual === "Finalizado") {
          setIsEditable(false);
          setErrorMsg("Este torneo no se puede editar porque ya ha finalizado.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al cargar la información requerida.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación específica al intentar modificar el campo de estado
    if (name === "estado") {
      if (estadoInicial === "Comenzo") {
        setSuccessMsg("");
        setErrorMsg("No se puede cambiar de estado una vez que el torneo ha iniciado.");
        return; // Evita que cambie el valor del select
      }

      if (estadoInicial === "Finalizado") {
        setSuccessMsg("");
        setErrorMsg("No se puede cambiar el estado de un torneo finalizado.");
        return;
      }
    }

    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) return;

    setErrorMsg("");
    setSuccessMsg("");

    // Verificación de seguridad antes de enviar
    if (estadoInicial === "Comenzo" && formData.estado !== estadoInicial) {
      setErrorMsg("No se puede cambiar de estado una vez que el torneo ha iniciado.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_TORNEOS}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Mensaje personalizado según si cambió el estado o solo otros datos
        if (formData.estado !== estadoInicial) {
          alert("¡Cambio de estado exitoso!");
        } else {
          alert("Torneo actualizado exitosamente");
        }
        navigate("/torneos");
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || "Error al actualizar el torneo");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión al servidor");
    }
  };

  if (loading) {
    return (
      <div className={styles.formContainer}>
        <p style={{ color: "#fff" }}>Cargando datos del torneo...</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.cardBox}>
        <h2 className={styles.titulo}>Editar Torneo</h2>

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
          {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

          <div>
            <label htmlFor="nombre_torneo">Nombre del Torneo</label>
            <input
              type="text"
              id="nombre_torneo"
              name="nombre_torneo"
              value={formData.nombre_torneo}
              onChange={handleChange}
              disabled={!isEditable || estadoInicial === "Comenzo"}
              required
            />
          </div>

          <div>
            <label htmlFor="id_categoria">Categoría</label>
            <select
              id="id_categoria"
              name="id_categoria"
              value={formData.id_categoria}
              onChange={handleChange}
              disabled={!isEditable || estadoInicial === "Comenzo"}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tipo_torneo">Tipo de Torneo</label>
            <select
              id="tipo_torneo"
              name="tipo_torneo"
              value={formData.tipo_torneo}
              onChange={handleChange}
              disabled={!isEditable || estadoInicial === "Comenzo"}
              required
            >
              <option value="">Seleccione tipo</option>
              <option value="Liga">Liga</option>
              <option value="Grupos">Grupos</option>
              <option value="Eliminacion Directa">Eliminación Directa</option>
            </select>
          </div>

          <div>
            <label htmlFor="ciudad">Ciudad</label>
            <input
              type="text"
              id="ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              disabled={!isEditable || estadoInicial === "Comenzo"}
              required
            />
          </div>

          <div>
            <label htmlFor="fecha_inicio">Fecha de Inicio</label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              disabled={!isEditable || estadoInicial === "Comenzo"}
              required
            />
          </div>

          <div>
            <label htmlFor="fecha_fin">Fecha de Finalización</label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              disabled={!isEditable || estadoInicial === "Comenzo"}
              required
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label htmlFor="estado">Estado del Torneo</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={!isEditable}
              required
            >
              <option value="Inscripciones Abiertas">Inscripciones Abiertas</option>
              <option value="Comenzo">Comenzó</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div className={styles.btnActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
            {isEditable && estadoInicial !== "Comenzo" && (
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnSubmit}`}
              >
                Guardar Cambios
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}