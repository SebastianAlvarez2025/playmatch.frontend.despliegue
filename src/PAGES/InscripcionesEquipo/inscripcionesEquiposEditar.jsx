/**
 * ==========================================================
 *  GESTIONAR ESTADO DE INSCRIPCIÓN
 * DESCRIPCIÓN:
 * El organizador del torneo aprueba (Inscrito) o cancela
 *  una inscripción que está en estado Pendiente.
 * ==========================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInscripcionById,
  updateInscripcion,
} from "../../services/inscripcionesEquipoService";
import "../../styles/estilosPages/inscripcionEquipo/inscripcionEditar.css";

export default function InscripcionesEquiposEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos de la inscripción que se está gestionando
  const [inscripcion, setInscripcion] = useState(null);

  // Controla el mensaje de "cargando..." mientras llega la info
  const [cargando, setCargando] = useState(true);

  // Controla que los botones se deshabiliten mientras se envía la petición
  const [procesando, setProcesando] = useState(false);

  // Guarda mensajes de error (de carga o de actualización)
  const [error, setError] = useState("");

  // Guarda el mensaje de éxito que se muestra en la propia página
  const [mensajeExito, setMensajeExito] = useState("");

  // Carga la inscripción apenas se entra a la página
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

  // Cambia el estado de la inscripción a "Inscrito" o "Cancelado"
  const cambiarEstado = async (nuevoEstado) => {
    try {
      setProcesando(true);
      setError("");

      await updateInscripcion(id, { estado: nuevoEstado });

      // Mensaje de éxito exacto según
      setMensajeExito("Inscripción actualizada correctamente.");

      // Actualizamos el estado local para que se oculten los botones
      setInscripcion((prev) => ({ ...prev, estado: nuevoEstado }));

      // Esperamos un momento para que el usuario alcance a leer el mensaje
      // antes de devolverlo a la lista de inscripciones del torneo
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      const mensaje =
        err.response?.data?.message || "No se pudo actualizar la inscripción.";
      setError(mensaje);
      setProcesando(false);
    }
  };

  // Mientras carga la información de la inscripción
  if (cargando) {
    return (
      <div className="inscripcion-editar-page">
        <p className="ie-cargando">Cargando...</p>
      </div>
    );
  }

  // Si hubo un error cargando y no se pudo obtener la inscripción
  if (error && !inscripcion) {
    return (
      <div className="inscripcion-editar-page">
        <p className="ie-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="inscripcion-editar-page">
      <div className="inscripcion-editar-tarjeta">
        <h1>Gestionar Inscripción</h1>

        <div className="ie-datos">
          <p>
            <span className="ie-etiqueta">Equipo:</span>{" "}
            <strong>{inscripcion.nombre_equipo}</strong>
          </p>
          <p>
            <span className="ie-etiqueta">Torneo:</span>{" "}
            <strong>{inscripcion.nombre_torneo}</strong>
          </p>
          <p>
            <span className="ie-etiqueta">Estado actual:</span>{" "}
            <strong
              className={`ie-badge ie-badge-${inscripcion.estado.toLowerCase()}`}
            >
              {inscripcion.estado}
            </strong>
          </p>
        </div>

        {/* Mensaje de error, si algo falló al actualizar */}
        {error && <p className="ie-error">{error}</p>}

        {/* Mensaje de éxito, reemplaza al alert() */}
        {mensajeExito && <p className="ie-exito">{mensajeExito}</p>}

        {/* Solo mostramos los botones si sigue Pendiente y no hay mensaje de éxito aún */}
        {inscripcion.estado === "Pendiente" && !mensajeExito ? (
          <div className="ie-acciones">
            <button
              className="btn-aprobar"
              onClick={() => cambiarEstado("Inscrito")}
              disabled={procesando}
            >
              ✅ Aprobar
            </button>
            <button
              className="btn-cancelar-inscripcion"
              onClick={() => cambiarEstado("Cancelado")}
              disabled={procesando}
            >
              ❌ Cancelar
            </button>
          </div>
        ) : (
          !mensajeExito && (
            <p className="ie-ya-gestionada">
              Esta inscripción ya fue gestionada anteriormente.
            </p>
          )
        )}
      </div>
    </div>
  );
}
