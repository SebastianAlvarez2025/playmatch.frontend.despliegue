/**
 * ==========================================================
  EDITAR EQUIPO
 * ==========================================================
 */

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEquipoById, updateEquipo } from "../../services/equiposService.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ROLES } from "../../constants/roles.js";
import "../../styles/estilosPages/equipos/equipoEditar.css";

export default function EquipoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [nombreEquipo, setNombreEquipo] = useState("");
  const [escudo, setEscudo] = useState("");
  const [previewEscudo, setPreviewEscudo] = useState("");

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [sinPermiso, setSinPermiso] = useState(false);

  // Cargamos la información actual del equipo al abrir la página
  useEffect(() => {
    const cargarEquipo = async () => {
      try {
        const equipo = await getEquipoById(id);

        // Validación de permisos 
        // solo el dueño del equipo o un Administrador puede editar
        const esDueno = user?.id_usuario === equipo.id_usuario;
        const esAdmin = user?.rol === ROLES.ADMINISTRADOR || user?.rol === ROLES.SUPERADMINISTRADOR;

        if (!esDueno && !esAdmin) {
          setSinPermiso(true);
          return;
        }

        setNombreEquipo(equipo.nombre_equipo);
        setEscudo(equipo.escudo);
        setPreviewEscudo(equipo.escudo);

      } catch (err) {
        setError("No se pudo cargar la información del equipo.");
      } finally {
        setCargando(false);
      }
    };

    cargarEquipo();
  }, [id, user]);

  const manejarCambioImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onloadend = () => {
      setEscudo(lector.result);
      setPreviewEscudo(lector.result);
    };
    lector.readAsDataURL(archivo);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombreEquipo.trim()) {
      setError("El nombre del equipo es obligatorio.");
      return;
    }



    try {
      setEnviando(true);

      await updateEquipo(id, {
        nombre_equipo: nombreEquipo,
        escudo: escudo,
      });

    alert("Equipo actualizado correctamente.");
      navigate(-1);

    } catch (err) {
      const mensaje =
        err.response?.data?.message || "No se pudo actualizar el equipo.";
      setError(mensaje);

    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p>Cargando...</p>;

  // Mensaje de Salida de fallo por permisos
  if (sinPermiso) {
    return <p className="error">No tiene permisos para editar este equipo.</p>;
  }

  return (
    <div className="container-editar">
      <div className="equipo-editar-page">
        <h2>Editar equipo</h2>

        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label htmlFor="nombre_equipo">Nombre del equipo</label>
            <input
              id="nombre_equipo"
              type="text"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="campo">
            <label htmlFor="escudo">Escudo del equipo</label>
            <input
              id="escudo"
              type="file"
              accept="image/png, image/jpeg"
              onChange={manejarCambioImagen}
            />
            <label htmlFor="escudo" className="boton-archivo">
              📁 Cargar imagen
            </label>

            {previewEscudo && (
              <img
                src={previewEscudo}
                alt="Vista previa del escudo"
                className="preview-escudo"
              />
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>
        </form>
      </div>
    </div>
  );
}