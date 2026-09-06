// ===================================================================
// JugadoresAdmin.jsx
// Vista de supervisión general de jugadores para el Administrador
// (RF-003: puede ver y desactivar cualquier jugador del sistema,
// sin importar a qué equipo pertenezca).
// ===================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJugadores } from "../../services/jugadoresService";
import Pagination from "../../components/Pagination";
import styles from "./JugadoresAdmin.module.css";

export default function JugadoresAdmin() {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const [jugadores, setJugadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const cargarJugadores = async () => {
    try {
      const data = await getJugadores();
      setJugadores(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarJugadores();
  }, []);

  // Filtro en vivo: busca por nombre del jugador o del equipo
  const jugadoresFiltrados = jugadores.filter((j) => {
    const texto = busqueda.toLowerCase();
    const nombreCompleto = `${j.nombre_usuario} ${j.apellido_usuario}`.toLowerCase();
    const equipo = j.nombre_equipo?.toLowerCase() || "";
    return nombreCompleto.includes(texto) || equipo.includes(texto);
  });

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const jugadoresPaginados = jugadoresFiltrados.slice(
    primerRegistro,
    ultimoRegistro
  );

  return (
    <div className={styles.container}>
      <div className={styles.tablaCard}>
        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Jugadores (Admin)</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <input
                type="text"
                placeholder="Buscar jugador o equipo..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
              />
              <span className={styles.iconoLupa}>🔍</span>
            </div>
          </div>
          {/* El Administrador no registra jugadores, solo supervisa
              y desactiva (RF-003) */}
        </div>

        <table className={styles.tablaJugadores}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Jugador</th>
              <th>Equipo</th>
              <th>Camiseta</th>
              <th>Goles</th>
            </tr>
          </thead>

          <tbody>
            {jugadoresPaginados.length > 0 ? (
              jugadoresPaginados.map((j) => (
                <tr key={j.id_jugador}>
                  <td>{j.id_jugador}</td>
                  <td>
                    {j.nombre_usuario} {j.apellido_usuario}
                  </td>
                  <td>{j.nombre_equipo}</td>
                  <td>{j.numero_camiseta}</td>
                  <td>{j.goles}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.sinDatos}>
                  No hay jugadores registrados
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