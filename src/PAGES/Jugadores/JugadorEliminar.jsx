// ===================================================================
// JugadorEliminar.jsx
// Desactiva (borrado lógico) un jugador. Permitido para el DT dueño
// del equipo o el Administrador (RF-003.4).
//
// Si el equipo del jugador tiene un encuentro en curso, el backend
// responde con una advertencia en vez de desactivar de una vez.
// Aquí mostramos esa advertencia y, si el usuario confirma que
// quiere seguir, volvemos a pedir la desactivación pero "forzada".
// ===================================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getJugadorById,
  desactivarJugador,
} from "../../services/jugadoresService";

import "../../styles/estilosPages/jugadores/jugadores.css";

export default function JugadorEliminar() {
  // El parámetro viene de la URL: /jugadores/eliminar/:id
  const { id } = useParams();
  const navigate = useNavigate();

  // ----------------------------
  // ESTADOS
  // ----------------------------
  const [jugador, setJugador] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // Cuando el backend responde con "requiereConfirmacion", guardamos
  // ese aviso aquí para mostrar la segunda confirmación
  const [advertenciaEncuentro, setAdvertenciaEncuentro] = useState("");

  // ----------------------------
  // CARGA INICIAL: traemos los datos del jugador a desactivar
  // ----------------------------
  useEffect(() => {
    const cargarJugador = async () => {
      try {
        setCargando(true);
        const data = await getJugadorById(id);
        setJugador(data);
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
  // FUNCIÓN: manejarDesactivar
  // forzar = false -> primer intento (respeta la advertencia)
  // forzar = true  -> el usuario ya confirmó, se desactiva igual
  // ----------------------------
  const manejarDesactivar = async (forzar = false) => {
    setMensajeError("");
    setMensajeExito("");

    try {
      setEnviando(true);

      await desactivarJugador(id, forzar);

      setMensajeExito("Jugador desactivado correctamente.");
      setAdvertenciaEncuentro("");

      // Regresa a la pantalla anterior (funciona igual si venías de
      // "Jugadores del equipo" del DT o de "Jugadores (Admin)")
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error(err);

      // Caso especial: el backend está avisando que hay un
      // encuentro en curso, y pide confirmación
      if (err.response?.data?.requiereConfirmacion) {
        setAdvertenciaEncuentro(err.response.data.msg);
      } else {
        // Cualquier otro error (permisos, jugador no existe, etc.)
        const mensajeBackend =
          err.response?.data?.msg ||
          "Ocurrió un error al desactivar el jugador.";
        setMensajeError(mensajeBackend);
      }
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
  // RENDERIZADO PRINCIPAL
  // ----------------------------
  return (
    <div className="detalle-container">
      <header className="detalle-header-1">
        <h1>Desactivar Jugador</h1>
      </header>

      <main className="detalle-main">
        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

        {/* Si NO hay advertencia de encuentro en curso todavía,
            mostramos la confirmación normal */}
        {!advertenciaEncuentro && !mensajeExito && (
          <>
            <p>
              ¿Seguro que deseas desactivar al jugador{" "}
              <strong>
                {jugador.nombre_usuario} {jugador.apellido_usuario}
              </strong>{" "}
              (#{jugador.numero_camiseta}) del equipo{" "}
              <strong>{jugador.nombre_equipo}</strong>?
            </p>

            <div className="form-botones">
              <button
                className="btn-desactivar-jugador"
                disabled={enviando}
                onClick={() => manejarDesactivar(false)}
              >
                {enviando ? "Procesando..." : "Sí, desactivar"}
              </button>
              <button
                className="btn-editar-jugador"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {/* Si el backend avisó que hay un encuentro en curso,
            mostramos la advertencia y pedimos confirmación extra */}
        {advertenciaEncuentro && !mensajeExito && (
          <>
            <p className="mensaje-error">{advertenciaEncuentro}</p>
            <p>¿Aun así deseas continuar con la desactivación?</p>

            <div className="form-botones">
              <button
                className="btn-desactivar-jugador"
                disabled={enviando}
                onClick={() => manejarDesactivar(true)}
              >
                {enviando ? "Procesando..." : "Sí, desactivar de todas formas"}
              </button>
              <button
                className="btn-editar-jugador"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}