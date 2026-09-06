import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createCronologia,
  getJugadoresByEncuentro,
} from "../../services/cronologiasService";

const API_BASE = import.meta.env.VITE_API_URL;

export default function CronologiasCrear() {
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  const [form, setForm] = useState({
    id_encuentro: "",
    id_jugador: "",
    evento: "Gol",
    minuto: "",
  });

  // Cargar encuentros
  useEffect(() => {
    const cargarEncuentros = async () => {
      try {
        const res = await fetch(`${API_BASE}/encuentros`);
        const data = await res.json();
        setEncuentros(data);
      } catch (error) {
        console.error(error);
      }
    };

    cargarEncuentros();
  }, []);

  // Cargar jugadores según encuentro
  const cargarJugadores = async (id_encuentro) => {
    try {
      const data = await getJugadoresByEncuentro(id_encuentro);
      setJugadores(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Cuando cambia encuentro, cargar jugadores correspondientes
    if (name === "id_encuentro") {
      if (value) {
        await cargarJugadores(value);
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
      await createCronologia(form);
      navigate("/cronologias");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="tabla-container">
        <div className="header-tabla">
          <h2 className="titulo">Crear Evento de Cronología</h2>
        </div>

        <form onSubmit={handleSubmit} className="formulario-admin">
          <div className="grupo-formulario">
            <label>Seleccionar Encuentro</label>
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

          <div className="grupo-formulario">
            <label>Seleccionar Jugador</label>
            <select
              name="id_jugador"
              value={form.id_jugador}
              onChange={handleChange}
              required
              disabled={!form.id_encuentro}
            >
              <option value="">
                {form.id_encuentro ? "Seleccione jugador" : "Primero elija un encuentro"}
              </option>
              {jugadores.map((j) => (
                <option key={j.id_jugador} value={j.id_jugador}>
                  {j.nombre_usuario} {j.apellido_usuario} - {j.nombre_equipo}
                </option>
              ))}
            </select>
          </div>

          <div className="grupo-formulario">
            <label>Tipo de Evento</label>
            <select name="evento" value={form.evento} onChange={handleChange}>
              <option value="Gol">Gol</option>
              <option value="Amarilla">Tarjeta Amarilla</option>
              <option value="Roja">Tarjeta Roja</option>
            </select>
          </div>

          <div className="grupo-formulario">
            <label>Minuto del Suceso</label>
            <input
              type="number"
              name="minuto"
              placeholder="Ej. 45"
              min="1"
              max="120"
              value={form.minuto}
              onChange={handleChange}
              required
            >
            </input>
          </div>

          <div className="acciones-formulario">
            <button type="submit" className="btn crear">
              Guardar Evento
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