import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipos, getEquiposByTorneo } from "../../services/equiposService.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ROLES } from "../../constants/roles.js";
import styles from "./Equipos.module.css"; 
import "../../styles/estilosPages/equipos/equipos.css";

// --- HELPER FUNCTIONS ---

const esEscudoValido = (escudo) => {
  if (!escudo || typeof escudo !== "string") return false;
  const limpio = escudo.trim();
  if (["", "null", "undefined"].includes(limpio)) return false;
  if (limpio.startsWith("data:image") && limpio.split(",")[1] === "") return false;
  return true;
};

const obtenerIniciales = (nombreEquipo) => {
  if (!nombreEquipo) return "?";

  const palabrasIgnoradas = ["de", "del", "la", "las", "los", "y", "fc", "cd", "club", "real"];

  const palabras = nombreEquipo
    .trim()
    .split(/\s+/)
    .filter((palabra) => !palabrasIgnoradas.includes(palabra.toLowerCase()));

  const listaProcesar = palabras.length > 0 ? palabras : nombreEquipo.trim().split(/\s+/);

  if (listaProcesar.length === 1) {
    return listaProcesar[0].substring(0, 2).toUpperCase();
  }

  return (listaProcesar[0][0] + listaProcesar[1][0]).toUpperCase();
};

const ComponenteEscudo = ({ equipo }) => {
  const [errorCarga, setErrorCarga] = useState(false);

  const mostrarImagen = esEscudoValido(equipo.escudo) && !errorCarga;

  return mostrarImagen ? (
    <img
      src={equipo.escudo}
      alt={`Escudo de ${equipo.nombre_equipo}`}
      className="equipo-escudo"
      onError={() => setErrorCarga(true)}
    />
  ) : (
    <div className="equipo-escudo-placeholder">
      {obtenerIniciales(equipo.nombre_equipo)}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function Equipos({ id_torneo } = {}) {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const admin =
    Number(user?.rol) === ROLES.SUPERADMINISTRADOR ||
    Number(user?.rol) === ROLES.ADMINISTRADOR;
  const entrenador = Number(user?.rol) === ROLES.ENTRENADOR;

  const cargarEquipos = async () => {
    try {
      setCargando(true);
      setError("");

      const data = id_torneo
        ? await getEquiposByTorneo(id_torneo)
        : await getEquipos();

      setEquipos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("No se pudieron cargar los equipos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, [id_torneo]);

  const equiposFiltrados = equipos.filter((eq) =>
    (eq.nombre_equipo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={styles.equiposContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.equiposHeader}>
          <h2 className={styles.titulo}>Equipos</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                id="buscar_equipo"
                type="text"
                placeholder="Buscar equipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {admin && (
              <button
                className={`${styles.btn} ${styles.btnGestionar}`}
                onClick={() => navigate("/equipos/admin")}
              >
                ⚙ Gestionar equipos
              </button>
            )}

            {entrenador && (
              <button
                className={`${styles.btn} ${styles.btnGestionar}`}
                onClick={() => navigate("/equipos/mios")}
              >
                ⚙ Mis equipos
              </button>
            )}
          </div>
        </div>

        {cargando && <p className={styles.noData}>Cargando equipos...</p>}
        {error && <p className={styles.noData}>{error}</p>}

        {!cargando && !error && (
          <div className={styles.cardsGrid}>
            {equiposFiltrados.length > 0 ? (
              equiposFiltrados.map((equipo) => (
                <div
                  key={equipo.id_equipo}
                  className={styles.equipoCard}
                >
                  <div>
                    <h3 className={styles.equipoTitle}>{equipo.nombre_equipo}</h3>

                    <div className={styles.dataContainer}>
                      <div className={styles.imgEquipo}>
                        <ComponenteEscudo equipo={equipo} />
                      </div>

                      <div className={styles.dataEquipo}>
                        <p>
                          <strong>Responsable:</strong>
                          <br />
                          {equipo.nombre_usuario || "Sin asignar"}{" "}
                          {equipo.apellido_usuario || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.footData}>
                    <div className={styles.equipoAcciones}>
                      <button
                        className={styles.btnVerJugadores}
                        onClick={
                          () => 
                          navigate(`/jugadoresEquipo/${equipo.id_equipo}`)
                        }
                      >
                        Ver Jugadores
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noData}>
                {id_torneo
                  ? "No hay equipos inscritos en este torneo."
                  : "No se encontraron equipos."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}