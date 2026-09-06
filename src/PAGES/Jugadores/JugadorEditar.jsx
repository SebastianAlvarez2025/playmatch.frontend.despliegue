// ===================================================================
// JugadorEditar.jsx
// Formulario para actualizar el número de camiseta de un jugador.
// Permitido para: el DT dueño del equipo, o el Administrador (RF-003.3)
// ===================================================================

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getJugadorById,
  updateJugador,
} from "../../services/jugadoresService";

import { AuthContext } from "../../context/AuthContext";

import "../../styles/estilosPages/jugadores/jugadores.css";

export default function JugadorEditar() {
  // El parámetro viene de la URL: /jugadores/editar/:id
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ----------------------------
  // ESTADOS
  // ----------------------------
  const [jugador, setJugador] = useState(null); // datos originales
  const [numeroCamiseta, setNumeroCamiseta] = useState(""); // valor del input

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // ----------------------------
  // CARGA INICIAL: traemos los datos actuales del jugador
  // ----------------------------
  useEffect(() => {
    const cargarJugador = async () => {
      try {
        setCargando(true);
        const data = await getJugadorById(id);
        setJugador(data);
        // Ponemos el número de camiseta actual en el input
        setNumeroCamiseta(data.numero_camiseta);
      } catch (err) {
        console.error(err);
        setMensajeError("No se pudo cargar la información del jugador.");
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarJugador();
    }
  }, [id]);

  // ----------------------------
  // FUNCIÓN: manejarEnvio
  // Se ejecuta cuando el usuario le da clic a "Guardar Cambios"
  // ----------------------------
  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    setMensajeExito("");
    setMensajeError("");

    if (!numeroCamiseta) {
      setMensajeError("Debes escribir el número de camiseta.");
      return;
    }

    try {
      setEnviando(true);

      // El backend toma el equipo del jugador directo de la base de
      // datos, así que aquí solo enviamos el número de camiseta.
      await updateJugador(id, {
        numero_camiseta: numeroCamiseta,
      });

      setMensajeExito("Jugador actualizado exitosamente.");

      // Regresa a la pantalla anterior (funciona igual si venías de
      // "Jugadores del equipo" del DT o de "Jugadores (Admin)")
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error(err);

      // El backend manda el mensaje exacto en el campo "msg"
      const mensajeBackend =
        err.response?.data?.msg ||
        "Ocurrió un error al actualizar el jugador.";
      setMensajeError(mensajeBackend);
    } finally {
      setEnviando(false);
    }
  };

  // ----------------------------
  // RENDERIZADO CONDICIONAL
  // ----------------------------
  if (cargando) return <p>Cargando...</p>;
  if (!jugador) return <p>Jugador no encontrado.</p>;

  // ----------------------------
  // RENDERIZADO PRINCIPAL: el formulario
  // ----------------------------
  return (
    <div className="detalle-container">
      <header className="detalle-header-1">
        <h1>Editar Jugador</h1>
      </header>

      <main className="detalle-main">
        <form onSubmit={manejarEnvio} className="form-jugador">
          {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
          {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

          {/* Mostramos el nombre del jugador solo como referencia,
              no se puede editar */}
          <p>
            Jugador:{" "}
            <strong>
              {jugador.nombre_usuario} {jugador.apellido_usuario}
            </strong>
          </p>

          <p>
            Equipo: <strong>{jugador.nombre_equipo}</strong>
          </p>

          <label htmlFor="camiseta">Número de camiseta:</label>
          <input
            id="camiseta"
            type="number"
            min="1"
            value={numeroCamiseta}
            onChange={(e) => setNumeroCamiseta(e.target.value)}
          />

          <div className="form-botones">
            <button
              type="submit"
              className="btn-inscribir-equipo"
              disabled={enviando}
            >
              {enviando ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              className="btn-desactivar-jugador"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}