import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCronologiaById,
  updateCronologia,
  getJugadoresByEncuentro,
} from "../../services/cronologiasService";

const API_BASE = import.meta.env.VITE_API_URL;

export default function CronologiasEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  const [form, setForm] = useState({
    id_encuentro: "",
    id_jugador: "",
    evento: "Gol",
    minuto: "",
  });

  // 1. Cargar encuentros iniciales al montar el componente
  useEffect(() => {
    const cargarEncuentros = async () => {
      try {
        const res = await fetch(`${API_BASE}/encuentros`);
        const data = await res.json();
        setEncuentros(data);
      } catch (error) {
        console.error("Error al cargar encuentros:", error);
      }
    };

    cargarEncuentros();
    cargarCronologiaCompleta();
  }, []);

  // 2. Cargar los datos específicos de la cronología a editar
  const cargarCronologiaCompleta = async () => {
    try {
      const data = await getCronologiaById(id);
      
      setForm({
        id_encuentro: data.id_encuentro,
        id_jugador: data.id_jugador,
        evento: data.evento,
        minuto: data.minuto,
      });

      // Importante: Cargar de inmediato los jugadores de ese encuentro específico
      if (data.id_encuentro) {
        const jugadoresData = await getJugadoresByEncuentro(data.id_encuentro);
        setJugadores(jugadoresData);
      }
    } catch (error) {
      console.error("Error al cargar la cronología:", error);
    }
  };

  // 3. Manejar los cambios en los inputs y selects
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Si el administrador cambia el encuentro, actualizar la lista de jugadores y limpiar la selección anterior
    if (name === "id_encuentro") {
      if (value) {
        try {
          const jugadoresData = await getJugadoresByEncuentro(value);
          setJugadores(jugadoresData);
        } catch (error) {
          console.error(error);
        }
      } else {
        setJugadores([]);
      }

      setForm((prev) => ({
        ...prev,
        id_encuentro: value,
        id_jugador: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCronologia(id, form);
      navigate("/cronologias");
    } catch (error) {
      console.error("Error al actualizar la cronología:", error);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="tabla-container">
        <div className="header-tabla">
          <h2 className="titulo">Editar Evento de Cronología (ID: {id})</h2>
        </div>

        <form onSubmit={handleSubmit} className="formulario-admin">
          {/* Selección de Encuentro */}
          <div className="grupo-formulario">
            <label>Encuentro</label>
            <select
              name="id_encuentro"
              value={form.id_encuentro}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione encuentro</option>
              {encuentros.map((e) => (
                <option key={e.id_encuentro} value={e.id_encuentro}>
                  {e.equipo_local} vs {e.equipo_visitante}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Jugador */}
          <div className="grupo-formulario">
            <label>Jugador</label>
            <select
              name="id_jugador"
              value={form.id_jugador}
              onChange={handleChange}
              required
              disabled={!form.id_encuentro}
            >
              <option value="">Seleccione jugador</option>
              {jugadores.map((j) => (
                <option key={j.id_jugador} value={j.id_jugador}>
                  {j.nombre_usuario} {j.apellido_usuario} - {j.nombre_equipo}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Evento */}
          <div className="grupo-formulario">
            <label>Tipo de Evento</label>
            <select name="evento" value={form.evento} onChange={handleChange}>
              <option value="Gol">Gol</option>
              <option value="Amarilla">Tarjeta Amarilla</option>
              <option value="Roja">Tarjeta Roja</option>
            </select>
          </div>

          {/* Entrada de Minuto */}
          <div className="grupo-formulario">
            <label>Minuto</label>
            <input
              type="number"
              name="minuto"
              placeholder="Ej. 75"
              min="1"
              max="120"
              value={form.minuto}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botones de acción */}
          <div className="acciones-formulario">
            <button type="submit" className="btn editar">
              Actualizar
            </button>
            <button
              type="button"
              className="btn eliminar"
              onClick={() => navigate("/cronologias")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}