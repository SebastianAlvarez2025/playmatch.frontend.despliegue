import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createInscripcion } from "../../services/inscripcionesEquipoService";
import { getEquipos } from "../../services/equiposService";

import "../../styles/estilosPages/inscripcionEquipo/inscripcionEquipos.css";

export default function InscripcionEquipoOrganizadorCrear() {
  const navigate = useNavigate();
  const { id_torneo } = useParams();

  const [equipos, setEquipos] = useState([]);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id_equipo: "",
  });

  // Obtener equipos
  const cargarEquipos = async () => {
    try {
      const data = await getEquipos();
      setEquipos(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  const handleChange = (e) => {
    const id = e.target.value;

    setForm({
      id_equipo: id,
    });

    const equipoEncontrado = equipos.find(
      (eq) => String(eq.id_equipo) === String(id),
    );

    if (equipoEncontrado) {
      setNombreEquipo(equipoEncontrado.nombre_equipo);
      setError("");
    } else {
      setNombreEquipo("");

      if (id !== "") {
        setError("No existe un equipo con ese ID");
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombreEquipo) {
      setError("Debe ingresar un ID de equipo válido");
      return;
    }

    try {
      await createInscripcion({
        id_torneo,
        id_equipo: form.id_equipo,
        estado: "Pendiente",
      });

      navigate(`/torneo/${id_torneo}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message || "Error al crear la inscripción",
      );
    }
  };

  return (
    <div className="usuarios-container">
      <div className="form-container">
        <h2 className="titulo">Inscribir Equipo al Torneo</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="formulario">
          <div className="grupo-form">
            <label>ID del Equipo</label>

            <input
              type="number"
              name="id_equipo"
              value={form.id_equipo}
              onChange={handleChange}
              placeholder="Ingrese el ID del equipo"
              required
            />
          </div>

          <div className="grupo-form">
            <label>Nombre del Equipo</label>

            <input
              type="text"
              value={nombreEquipo}
              disabled
              placeholder="El nombre aparecerá automáticamente"
            />
          </div>

          <div className="acciones-form">
            <button type="submit" className="btn crear">
              Inscribir
            </button>

            <button
              type="button"
              className="btn cancelar"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
