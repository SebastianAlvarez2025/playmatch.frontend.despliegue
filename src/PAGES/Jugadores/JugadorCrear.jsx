// ===================================================================
// JugadorCrear.jsx
// Formulario para que el DT registre un jugador nuevo dentro de
// UNO de sus equipos.
//
// El jugador SIEMPRE debe ser un usuario ya existente en el sistema
// con rol Jugador ("un usuario, un jugador" - RN-001). El DT no
// escribe datos a mano: busca al usuario (principalmente por su
// número de documento, que en este sistema es el mismo id_usuario)
// y solo le asigna el número de camiseta para su equipo.
// ===================================================================

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Trae la lista de usuarios DISPONIBLES para ser jugadores
// (ya filtrados por rol Jugador y sin ficha de jugador activa)
import { getUsuariosDisponibles } from "../../services/usuariosService";

// Crea el jugador en el backend
import { createJugador } from "../../services/jugadoresService";

// Para mostrar el nombre del equipo en el título
import { getEquipoById } from "../../services/equiposService";

import { AuthContext } from "../../context/AuthContext";

import "../../styles/estilosPages/jugadores/jugadores.css";

export default function JugadorCrear() {
  // idEquipo viene de la URL: /jugadores/crear/:idEquipo
  const { idEquipo } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ----------------------------
  // ESTADOS
  // ----------------------------
  const [equipo, setEquipo] = useState(null);
  const [usuarios, setUsuarios] = useState([]); // lista completa de usuarios disponibles

  // Texto que el DT escribe en el buscador (número de documento o nombre)
  const [busqueda, setBusqueda] = useState("");

  // Usuario que el DT ya seleccionó de la lista de sugerencias
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Controla si mostramos o no la lista de sugerencias desplegable
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [numeroCamiseta, setNumeroCamiseta] = useState("");

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // ----------------------------
  // CARGA INICIAL: traemos el equipo y la lista de usuarios
  // disponibles para ser registrados como jugadores
  // ----------------------------
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const equipoData = await getEquipoById(idEquipo);
        setEquipo(equipoData);

        const usuariosData = await getUsuariosDisponibles();
        setUsuarios(usuariosData || []);
      } catch (err) {
        console.error(err);
        setMensajeError("No se pudo cargar la información necesaria.");
      } finally {
        setCargando(false);
      }
    };

    if (idEquipo) {
      cargarDatos();
    }
  }, [idEquipo]);

  // ----------------------------
  // Filtramos la lista de usuarios según lo que el DT va escribiendo.
  // El id_usuario en este sistema ES el número de documento, así que
  // comparamos primero por ahí (búsqueda principal), y también por
  // nombre/apellido por si el DT prefiere buscar así.
  // ----------------------------
  const textoBusqueda = busqueda.toLowerCase().trim();

  const usuariosFiltrados = usuarios.filter((u) => {
    const documento = String(u.id_usuario);
    const nombreCompleto =
      `${u.nombre_usuario} ${u.apellido_usuario}`.toLowerCase();

    return (
      documento.includes(textoBusqueda) ||
      nombreCompleto.includes(textoBusqueda)
    );
  });

  // Se ejecuta cuando el DT escribe en el buscador
  const manejarCambioBusqueda = (e) => {
    setBusqueda(e.target.value);
    setUsuarioSeleccionado(null); // si escribe, invalidamos la selección anterior
    setMostrarSugerencias(true);
  };

  // Se ejecuta cuando el DT hace clic en un usuario de la lista
  const seleccionarUsuario = (u) => {
    setUsuarioSeleccionado(u);
    setBusqueda(`${u.id_usuario} - ${u.nombre_usuario} ${u.apellido_usuario}`);
    setMostrarSugerencias(false);
  };

  // ----------------------------
  // FUNCIÓN: manejarEnvio
  // Se ejecuta cuando el DT le da clic a "Registrar Jugador"
  // ----------------------------
  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    setMensajeExito("");
    setMensajeError("");

    // Validación: el DT debe haber elegido un usuario de la lista
    if (!usuarioSeleccionado) {
      setMensajeError(
        "Debes buscar por número de documento y seleccionar un jugador de la lista."
      );
      return;
    }
    if (!numeroCamiseta) {
      setMensajeError("Debes escribir el número de camiseta.");
      return;
    }

    try {
      setEnviando(true);

      const nuevoJugador = {
        id_usuario: usuarioSeleccionado.id_usuario,
        id_equipo: idEquipo,
        numero_camiseta: numeroCamiseta,
      };

      await createJugador(nuevoJugador);

      setMensajeExito("Jugador registrado exitosamente.");

      setTimeout(() => {
        navigate(`/jugadoresEquipo/${idEquipo}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      const mensajeBackend =
        err.response?.data?.msg || "Ocurrió un error al registrar el jugador.";
      setMensajeError(mensajeBackend);
    } finally {
      setEnviando(false);
    }
  };

  // ----------------------------
  // RENDERIZADO CONDICIONAL
  // ----------------------------
  if (cargando) return <p>Cargando...</p>;
  if (!equipo) return <p>Equipo no encontrado.</p>;

  // ----------------------------
  // RENDERIZADO PRINCIPAL: el formulario
  // ----------------------------
  return (
    <div className="detalle-container">
      <header className="detalle-header-1">
        <h1>Registrar Jugador - {equipo.nombre_equipo}</h1>
      </header>

      <main className="detalle-main">
        <form onSubmit={manejarEnvio} className="form-jugador">
          {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
          {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

          {/* Buscador de jugador por número de documento (o nombre) */}
          <label htmlFor="buscador">Buscar jugador por número de documento:</label>
          <div className="buscador-jugador">
            <input
              id="buscador"
              type="text"
              placeholder="Escribe el número de documento o el nombre..."
              value={busqueda}
              onChange={manejarCambioBusqueda}
              onFocus={() => setMostrarSugerencias(true)}
              autoComplete="off"
            />

            {/* Lista de sugerencias, solo se muestra mientras se escribe */}
            {mostrarSugerencias && busqueda && !usuarioSeleccionado && (
              <ul className="lista-sugerencias">
                {usuariosFiltrados.length === 0 ? (
                  <li className="sugerencia-vacia">
                    No se encontraron usuarios con rol Jugador disponibles.
                  </li>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <li
                      key={u.id_usuario}
                      onClick={() => seleccionarUsuario(u)}
                    >
                      <strong>{u.id_usuario}</strong> — {u.nombre_usuario}{" "}
                      {u.apellido_usuario}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Número de camiseta */}
          <label htmlFor="camiseta">Número de camiseta:</label>
          <input
            id="camiseta"
            type="number"
            min="1"
            value={numeroCamiseta}
            onChange={(e) => setNumeroCamiseta(e.target.value)}
          />

          {/* Botones */}
          <div className="form-botones">
            <button type="submit" className="btn-inscribir-equipo" disabled={enviando}>
              {enviando ? "Guardando..." : "Registrar Jugador"}
            </button>
            <button
              type="button"
              className="btn-desactivar-jugador"
              onClick={() => navigate(`/jugadoresEquipo/${idEquipo}`)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}