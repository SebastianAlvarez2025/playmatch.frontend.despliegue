/**
 * ==========================================================
 *  CREAR EQUIPO
 *
 * DESCRIPCIÓN:
 * Formulario para que el DT registre un nuevo equipo con
 * nombre y escudo (imagen elegida desde galería/archivos).
 * ==========================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEquipo } from "../../services/equiposService.js";
import "../../styles/estilosPages/equipos/equipoCrear.css";

export default function EquipoCrear() {
  const navigate = useNavigate();

  // Guardamos los valores del formulario
  const [nombreEquipo, setNombreEquipo] = useState("");

  // Guardamos la imagen ya convertida a base64 (string)
  const [escudo, setEscudo] = useState("");

  // Para mostrarle al usuario una vista previa de la imagen elegida
  const [previewEscudo, setPreviewEscudo] = useState("");

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  /**
   * Se ejecuta cuando el usuario elige un archivo de imagen.
   * Convierte el archivo a un string base64 usando FileReader,
   * que es la forma en que el backend espera recibir el escudo
   * (ya que el backend no tiene multer para subir archivos).
   */
  const manejarCambioImagen = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onloadend = () => {
      // lector.result ya viene como "data:image/png;base64,......"
      setEscudo(lector.result);
      setPreviewEscudo(lector.result);
    };

    lector.readAsDataURL(archivo);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas 
    if (!nombreEquipo.trim()) {
      setError("El nombre del equipo es obligatorio.");
      return;
    }

    if (nombreEquipo.length > 255) {
      setError("El nombre del equipo no puede superar los 255 caracteres.");
      return;
    }

    try {
      setEnviando(true);

      await createEquipo({
        nombre_equipo: nombreEquipo,
        escudo: escudo,
      });

      alert("Equipo registrado exitosamente.");
      navigate("/equipos");

    } catch (err) {
      // Este mensaje viene directo del backend
      // (ejemplo: "Ya existe un equipo con ese nombre.")
      const mensaje =
        err.response?.data?.message || "No se pudo registrar el equipo.";
      setError(mensaje);

    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="equipo-crear-page">
      <h1>Crear Equipo</h1>

      <form onSubmit={manejarEnvio}>
        <div className="campo">
          <label htmlFor="nombre_equipo">Nombre del equipo</label>
          <input
            id="nombre_equipo"
            type="text"
            value={nombreEquipo}
            onChange={(e) => setNombreEquipo(e.target.value)}
            maxLength={255}
            placeholder="Ej: Halcones FC"
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

          {/* Vista previa de la imagen elegida */}
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
          {enviando ? "Guardando..." : "Guardar Equipo"}
        </button>
      </form>
    </div>
  );
}