import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styles from "./TorneoEliminar.module.css"; 

const API = import.meta.env.VITE_API_URL + "/torneos";

export default function TorneoEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [torneo, setTorneo] = useState({
    nombre_torneo: "",
    tipo_torneo: "",
    ciudad: "",
  });
  
  // 🎯 Estado para capturar y mostrar errores del backend elegantemente
  const [error, setError] = useState("");

  // GET TORNEO
  const getTorneo = async () => {
    try {
      const res = await fetch(`${API}/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No se pudo recuperar la información del torneo.");
        return;
      }

      const torneoData = data?.data || data;
      setFormTorneo(torneoData);
    } catch (err) {
      console.error("ERROR:", err.message);
      setError("Error de conexión al recuperar el torneo.");
    }
  };

  const setFormTorneo = (data) => {
    const item = Array.isArray(data) ? data[0] : data;
    setTorneo({
      nombre_torneo: item?.nombre_torneo || "",
      ciudad: item?.ciudad || "",
      tipo_torneo: item?.tipo_torneo || "",
    });
  };

  useEffect(() => {
    if (id) getTorneo();
  }, [id]);

  // DELETE
  const eliminarTorneo = async () => {
    setError(""); 
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // 🎯 Si el modelo lanza el error de "tiene equipos inscritos", caerá aquí
        throw new Error(data?.message || "Error al Desactivar el torneo");
      }

      alert("Torneo Desactivado con éxito 🏁");
      navigate("/torneos");
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.titulo}>Desactivar Torneo</h2>

        {/* 🎯 Alerta visual si ocurre un error (ej: Equipos inscritos bloqueando el delete) */}
        {error && <p style={{ color: "#ef4444", textAlign: "center", marginBottom: "16px", fontSize: "0.95rem", fontWeight: "500" }}>{error}</p>}

        <div className={styles.infoPreview}>
          {/* 🎯 Fallbacks '|| ""' agregados por seguridad contra valores null insospechados */}
          <input type="text" value={torneo.nombre_torneo || ""} disabled />
          <input type="text" value={torneo.tipo_torneo || ""} disabled />
          <input type="text" value={torneo.ciudad || ""} disabled />
        </div>

        <div className={styles.advertenciaBox}>
          <p className={styles.advertenciaText}>
            ¿Seguro que deseas desactivar este torneo? Los encuentros y estadísticas asociados podrían dejar de estar visibles.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnConfirmar}`}
            onClick={eliminarTorneo}
          >
            Sí, Desactivar
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnCancelar}`}
            onClick={() => navigate("/torneos/mios")}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}