/**
 * ==========================================================
 *  RETIRAR INSCRIPCIÓN (DT)
 * 
 *
 * DESCRIPCIÓN:
 * El DT puede retirar (eliminar lógicamente) una solicitud
 * de inscripción, normalmente mientras está en Pendiente.
 * ==========================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInscripcionById,
  deleteInscripcion,
} from "../../services/inscripcionesEquipoService";
import "../../styles/estilosPages/inscripcionEquipo/inscripcionEliminar.css";

export default function InscripcionesEquiposEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inscripcion, setInscripcion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getInscripcionById(id);
        setInscripcion(data);
      } catch (err) {
        setError("No se pudo cargar la inscripción.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const confirmarRetiro = async () => {
    try {
      setProcesando(true);
      await deleteInscripcion(id);
      alert("Solicitud de inscripción retirada.");
      navigate("/inscripcionEquipos");
    } catch (err) {
      const mensaje =
        err.response?.data?.message || "No se pudo retirar la inscripción.";
      setError(mensaje);
      setProcesando(false);
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (error && !inscripcion) return <p className="error">{error}</p>;

  return (
    <div className="inscripcion-eliminar-page">
      <h1>Retirar Solicitud de Inscripción</h1>

      <p>
        ¿Está seguro de que desea retirar la solicitud de inscripción de{" "}
        <strong>{inscripcion.nombre_equipo}</strong> al torneo{" "}
        <strong>{inscripcion.nombre_torneo}</strong>?
      </p>

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button onClick={confirmarRetiro} disabled={procesando}>
          {procesando ? "Procesando..." : "Sí, retirar"}
        </button>
        <button onClick={() => navigate("/inscripcionEquipos")} disabled={procesando}>
          Cancelar
        </button>
      </div>
    </div>
  );
}