/**
 * ==========================================================
 * DESACTIVAR EQUIPO
 * ==========================================================
 */

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEquipoById, deleteEquipo } from "../../services/equiposService.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ROLES } from "../../constants/roles.js";
import "../../styles/estilosPages/equipos/equipoEliminar.css";

export default function EquipoEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [equipo, setEquipo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [sinPermiso, setSinPermiso] = useState(false);

  useEffect(() => {
    const cargarEquipo = async () => {
      try {
        const data = await getEquipoById(id);

        const esDueno = user?.id_usuario === data.id_usuario;
        const esAdmin = user?.rol === ROLES.ADMINISTRADOR || user?.rol === ROLES.SUPERADMINISTRADOR;

        if (!esDueno && !esAdmin) {
          setSinPermiso(true);
          return;
        }

        setEquipo(data);

      } catch (err) {
        setError("No se pudo cargar el equipo.");
      } finally {
        setCargando(false);
      }
    };

    cargarEquipo();
  }, [id, user]);

  const confirmarDesactivacion = async () => {
    try {
      setProcesando(true);
      await deleteEquipo(id);
      alert("Equipo desactivado correctamente.");
      navigate(-1);
    } catch (err) {
      const mensaje =
        err.response?.data?.message || "No se pudo desactivar el equipo.";
      setError(mensaje);
      setProcesando(false);
    }
  };

  if (cargando) return <p>Cargando...</p>;

  if (sinPermiso) {
    return <p className="error">No tiene permisos para desactivar este equipo.</p>;
  }

  return (
    <div className="equipo-eliminar-page">
      <h1>Desactivar Equipo</h1>

      <p>
        ¿Está seguro de que desea desactivar el equipo{" "}
        <strong>{equipo.nombre_equipo}</strong>?
      </p>

      {/* Advertencia  */}
      <p className="advertencia">
        ⚠️ Verifique que el equipo no tenga encuentros pendientes o en curso
        antes de continuar. Esta acción no elimina el historial del equipo,
        solo lo marca como inactivo.
      </p>

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button onClick={confirmarDesactivacion} disabled={procesando}>
          {procesando ? "Procesando..." : "Sí, desactivar"}
        </button> 

        <button onClick={() => navigate(-1)} disabled={procesando}>
          Cancelar
        </button>
      </div>
    </div>
  );
}