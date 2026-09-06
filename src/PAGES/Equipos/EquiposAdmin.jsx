import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipos } from "../../services/equiposService";
import Pagination from "../../components/Pagination";
import styles from "./EquiposAdmin.module.css";

export default function EquiposAdmin() {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const cargarEquipos = async () => {
    try {
      const data = await getEquipos();
      setEquipos(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  // Filtrado por nombre de equipo (búsqueda en vivo)
  const equiposFiltrados = equipos.filter((e) =>
    e.nombre_equipo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const equiposPaginados = equiposFiltrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.container}>
      <div className={styles.tablaCard}>
        <div className={styles.headerTabla}>
          <h2 className={styles.titulo}>Equipos (Admin)</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <input
                type="text"
                placeholder="Buscar equipo..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
              />
              <span className={styles.iconoLupa}>🔍</span>
            </div>
          </div>
        </div>

        <table className={styles.tablaEquipos}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Escudo</th>
              <th>Equipo</th>
              <th>Director Técnico</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {equiposPaginados.length > 0 ? (
              equiposPaginados.map((e) => (
                <tr key={e.id_equipo}>
                  <td>{e.id_equipo}</td>
                  <td>
                    <img
                      src={e.escudo}
                      alt={e.nombre_equipo}
                      className={styles.escudoContenedor}
                    />
                  </td>
                  <td>{e.nombre_equipo}</td>
                  <td>{e.nombre_usuario}</td>
                  <td className={styles.acciones}>
                    <button
                      className={`${styles.btn} ${styles.btnEditar}`}
                      onClick={() => navigate(`/equipos/editar/${e.id_equipo}`)}
                    >
                      Editar
                    </button>

                    <button
                      className={`${styles.btn} ${styles.btnEliminar}`}
                      onClick={() => navigate(`/equipos/eliminar/${e.id_equipo}`)}
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.sinDatos}>
                  No hay equipos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          totalRegistros={equiposFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
        />
      </div>
    </div>
  );
}