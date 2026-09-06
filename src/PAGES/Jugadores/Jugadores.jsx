// ===================================================================
// Jugadores.jsx
// Vista "Mi Equipo > Jugadores" del Director Técnico. Muestra la
// plantilla del equipo del DT logueado, separada en dos pestañas:
// Activos e Inactivos. Desde "Inactivos" se puede reactivar un
// jugador con un solo clic.
// ===================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisEquipos } from "../../services/equiposService";
import {
  getJugadoresPorEquipo,
  reactivarJugador,
} from "../../services/jugadoresService";
import styles from "./Jugadores.module.css";
import Pagination from "../../components/Pagination";

export default function Jugadores() {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Pestaña activa: "activos" o "inactivos"
  const [pestaña, setPestaña] = useState("activos");

  const [mensaje, setMensaje] = useState("");
  const [reactivando, setReactivando] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Traemos el equipo del DT logueado
      const misEquipos = await getMisEquipos();
      const equipoPrincipal =
        misEquipos && misEquipos[0] ? misEquipos[0] : null;
      setEquipo(equipoPrincipal);

      if (!equipoPrincipal) {
        setJugadores([]);
        return;
      }

      // 2. Traemos TODOS los jugadores del equipo (activos e inactivos)
      const data = await getJugadoresPorEquipo(equipoPrincipal.id_equipo);
      setJugadores(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtramos según la pestaña activa
  const jugadoresFiltrados = jugadores.filter((j) =>
    pestaña === "activos" ? j.activo === 1 : j.activo === 0
  );

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const jugadoresPaginados = jugadoresFiltrados.slice(
    primerRegistro,
    ultimoRegistro
  );

  const cambiarPestaña = (nueva) => {
    setPestaña(nueva);
    setPaginaActual(1);
    setMensaje("");
  };

  const manejarReactivar = async (id) => {
    try {
      setReactivando(id);
      await reactivarJugador(id);
      setMensaje("Jugador reactivado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);
      const mensajeBackend =
        err.response?.data?.msg || "No se pudo reactivar el jugador.";
      setMensaje(mensajeBackend);
    } finally {
      setReactivando(null);
    }
  };

  if (cargando) {
    return <p className={styles.estadoText}>Cargando...</p>;
  }

  if (!equipo) {
    return (
      <div className={styles.container}>
        <div className={styles.tablaWrapper}>
          <p className={styles.estadoText}>
            Aún no tienes un equipo registrado. Crea tu equipo primero para
            poder registrar jugadores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tablaWrapper}>
        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Jugadores - {equipo.nombre_equipo}</h2>

          <button
            className={styles.btnCrear}
            onClick={() => navigate(`/jugadores/crear/${equipo.id_equipo}`)}
          >
            Crear
          </button>
        </div>

        {/* Pestañas Activos / Inactivos */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => cambiarPestaña("activos")}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid rgba(147, 51, 234, 0.4)",
              cursor: "pointer",
              fontWeight: 600,
              backgroundColor:
                pestaña === "activos" ? "#9333ea" : "transparent",
              color: pestaña === "activos" ? "#ffffff" : "#a78bfa",
            }}
          >
            Activos
          </button>

          <button
            onClick={() => cambiarPestaña("inactivos")}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid rgba(147, 51, 234, 0.4)",
              cursor: "pointer",
              fontWeight: 600,
              backgroundColor:
                pestaña === "inactivos" ? "#9333ea" : "transparent",
              color: pestaña === "inactivos" ? "#ffffff" : "#a78bfa",
            }}
          >
            Inactivos
          </button>
        </div>

        {mensaje && <p className={styles.estadoText}>{mensaje}</p>}

        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Número</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {jugadoresFiltrados.length > 0 ? (
              jugadoresPaginados.map((j) => (
                <tr key={j.id_jugador}>
                  <td>{j.id_jugador}</td>

                  <td>
                    {j.nombre_usuario} {j.apellido_usuario}
                  </td>

                  <td>{j.numero_camiseta}</td>

                  <td>{j.activo ? "Activo" : "Inactivo"}</td>

                  <td className={styles.acciones}>
                    {pestaña === "activos" ? (
                      <>
                        <button
                          className={styles.btnEditar}
                          onClick={() =>
                            navigate(`/jugadores/editar/${j.id_jugador}`)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className={styles.btnEliminar}
                          onClick={() =>
                            navigate(`/jugadores/eliminar/${j.id_jugador}`)
                          }
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.btnEditar}
                        disabled={reactivando === j.id_jugador}
                        onClick={() => manejarReactivar(j.id_jugador)}
                      >
                        {reactivando === j.id_jugador
                          ? "Reactivando..."
                          : "Reactivar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.estadoText}>
                  {pestaña === "activos"
                    ? "No hay jugadores activos en tu equipo"
                    : "No hay jugadores inactivos"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          totalRegistros={jugadoresFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
        />
      </div>
    </div>
  );
}