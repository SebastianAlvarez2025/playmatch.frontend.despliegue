// ===================================================================
// JugadoresEquipo.jsx
// Muestra la plantilla (lista de jugadores) de un equipo específico.
// Si el usuario logueado es el DT dueño del equipo, además muestra
// botones para administrar (registrar, editar, desactivar jugadores).
// ===================================================================

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Servicio que ya creamos antes: trae los jugadores de un equipo
// desde el backend (GET /api/jugadores/equipo/:id_equipo)
import { getJugadoresPorEquipo } from "../../services/jugadoresService";

// Servicio que ya existía: trae los datos de un equipo por su id
import { getEquipoById } from "../../services/equiposService";

// Contexto de autenticación: aquí sabemos quién está logueado
import { AuthContext } from "../../context/AuthContext";

// Constantes de roles (INVITADO, ADMINISTRADOR, ORGANIZADOR, etc.)
import { ROLES } from "../../constants/roles";

// Hoja de estilos de este módulo
import "../../styles/estilosPages/jugadores/jugadores.css";

export default function JugadoresEquipo() {
  // idEquipo viene de la URL, ruta real: /jugadoresEquipo/:idEquipo
  const { idEquipo } = useParams();

  // Sirve para redirigir a otras páginas (ej: registrar jugador)
  const navigate = useNavigate();

  // Sacamos el usuario logueado desde el contexto de autenticación
  const { user } = useContext(AuthContext);

  // ----------------------------
  // ESTADOS 
  // ----------------------------
  const [equipo, setEquipo] = useState(null); // datos del equipo
  const [jugadores, setJugadores] = useState([]); // lista de jugadores
  const [cargando, setCargando] = useState(true); // ¿está cargando?
  const [error, setError] = useState(""); // mensaje de error, si hay

  // ----------------------------
  // FUNCIÓN: cargarDatos
  // Pide al backend los datos del equipo y su lista de jugadores.
  // ----------------------------
  const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Traemos los datos del equipo (nombre, escudo, dueño, etc.)
      const equipoData = await getEquipoById(idEquipo);
      setEquipo(equipoData);

      // 2. Traemos los jugadores que pertenecen a ese equipo
      const jugadoresData = await getJugadoresPorEquipo(idEquipo);
      setJugadores(jugadoresData || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del equipo.");
    } finally {
      setCargando(false);
    }
  };

  // useEffect: se ejecuta apenas la pantalla carga (o si cambia el
  // idEquipo de la URL), y llama a cargarDatos()
  useEffect(() => {
    if (idEquipo) {
      cargarDatos();
    }
  }, [idEquipo]);

  // ----------------------------
  // ¿El usuario logueado es el DT dueño de este equipo?
  // Solo si es así, mostramos los botones de administración.
  // ----------------------------
  const esDuenoDelEquipo =
    user &&
    equipo &&
    user.rol === ROLES.ENTRENADOR &&
    user.id_usuario === equipo.id_usuario;

  // ----------------------------
  // RENDERIZADO CONDICIONAL: mientras carga o si hay error
  // ----------------------------
  if (cargando) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!equipo) return <p>Equipo no encontrado.</p>;

  // ----------------------------
  // RENDERIZADO PRINCIPAL DE LA PÁGINA
  // ----------------------------
  return (
    <div className="detalle-container">
      {/* ENCABEZADO: escudo, nombre del equipo y capitán */}
      <header className="detalle-header-1">
        <div className="cabecera">
          <h2 className="titulo">{equipo.nombre_equipo}</h2>
        </div>

        <div className="data-detalle">
          <div>
            <img src={equipo.escudo} alt={equipo.nombre_equipo} />
          </div>

          <div className="info">
            <p className="torneo-subtitulo">
              <strong>Capitán:</strong>{" "}
              {equipo.nombre_usuario}
            </p>

            <p className="torneo-subtitulo">
              <strong>Jugadores registrados:</strong>{" "}
              {jugadores.length}
            </p>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: la plantilla de jugadores */}
      <main className="detalle-main">
        {/* Barra superior con el título y el botón de registrar */}
        <div className="jugadores-toolbar">
          <h2>Plantilla del equipo</h2>

          {/* Este botón SOLO aparece si eres el DT dueño del equipo */}
          {esDuenoDelEquipo && (
            <button
              className="btn-inscribir-equipo"
              onClick={() => navigate(`/jugadores/crear/${idEquipo}`)}
            >
              Registrar Jugador
            </button>
          )}
        </div>

        {/* Si no hay jugadores, mostramos un mensaje */}
        {jugadores.length === 0 ? (
          <p>No hay jugadores registrados en este equipo.</p>
        ) : (
          // Si hay jugadores, los recorremos uno por uno con .map()
          <div className="contenedor-jugadores-card">
            {jugadores.map((j) => (
              <div key={j.id_jugador} className="jugador-card">
                {/* Número de camiseta */}
                <div className="jugador-camiseta">#{j.numero_camiseta}</div>

                {/* Nombre del jugador, goles y tarjetas */}
                <div className="jugador-info-plantilla">
                  <span className="jugador-nombre">
                    {j.nombre_usuario} {j.apellido_usuario}
                  </span>
                  <span className="jugador-dato">Goles: {j.goles}</span>
                  <span className="jugador-dato">
                    Tarjetas: {j.tarjetas ? j.tarjetas : "Ninguna"}
                  </span>
                </div>

                {/* Botones de Editar/Desactivar: solo para el DT dueño */}
                {esDuenoDelEquipo && (
                  <div className="jugador-acciones">
                    <button
                      className="btn-editar-jugador"
                      onClick={() =>
                        navigate(`/jugadores/editar/${j.id_jugador}`)
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn-desactivar-jugador"
                      onClick={() =>
                        navigate(`/jugadores/eliminar/${j.id_jugador}`)
                      }
                    >
                      Desactivar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}