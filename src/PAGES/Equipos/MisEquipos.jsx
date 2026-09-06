import { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { getEquipos } from "../../services/equiposService.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ROLES } from "../../constants/roles.js";
import styles from "./MisEquipos.module.css";

// --- UTILIDADES ---

const esEscudoValido = (escudo) => {
  if (!escudo || typeof escudo !== "string") return false;
  const limpio = escudo.trim();
  if (["", "null", "undefined"].includes(limpio)) return false;
  if (limpio.startsWith("data:image") && limpio.split(",")[1] === "") return false;
  return true;
};

const obtenerIniciales = (nombre) => {
  if (!nombre) return "?";
  const ignoradas = ["de", "del", "la", "las", "los", "y", "fc", "cd", "club", "real"];
  const palabras = nombre
    .trim()
    .split(/\s+/)
    .filter((p) => !ignoradas.includes(p.toLowerCase()));

  const lista = palabras.length > 0 ? palabras : nombre.trim().split(/\s+/);
  if (lista.length === 1) return lista[0].substring(0, 2).toUpperCase();
  return (lista[0][0] + lista[1][0]).toUpperCase();
};

// --- SUBCOMPONENTES ---

const EscudoEquipo = ({ equipo }) => {
  const [errorCarga, setErrorCarga] = useState(false);
  const tieneImagen = esEscudoValido(equipo.escudo) && !errorCarga;

  return tieneImagen ? (
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

export default function MisEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const { user } = useContext(AuthContext);

  const cargarMisEquipos = useCallback(async () => {
    if (!user?.id_usuario) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const data = await getEquipos();
      const todosLosEquipos = Array.isArray(data) ? data : [];

      // Filtro estricto: Solo mostrar equipos creados por el usuario en sesión
      const deMiPropiedad = todosLosEquipos.filter(
        (eq) => eq.id_usuario === user.id_usuario
      );

      setEquipos(deMiPropiedad);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar tus equipos.");
    } finally {
      setCargando(false);
    }
  }, [user?.id_usuario]);

  useEffect(() => {
    cargarMisEquipos();
  }, [cargarMisEquipos]);

  // Filtrado secundario mediante barra de búsqueda
  const equiposFiltrados = equipos.filter((eq) =>
    (eq.nombre_equipo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Verificación de rol para el botón de creación
  const puedeCrearEquipo =
    user &&
    [ROLES.ENTRENADOR, ROLES.ADMINISTRADOR, ROLES.SUPERADMINISTRADOR].includes(
      user.rol
    );

  return (
    <div className={styles.equiposContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.equiposHeader}>
          <h1 className={styles.titulo}>Mis Equipos</h1>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                type="text"
                placeholder="Buscar en mis equipos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {puedeCrearEquipo && (
              <Link
                to="/equipos/crear"
                className={`${styles.btn} ${styles.btnGestionar}`}
              >
                + Crear Equipo
              </Link>
            )}
          </div>
        </div>

        {cargando && <p className={styles.noData}>Cargando tus equipos...</p>}
        {error && <p className={styles.noData}>{error}</p>}

        {!cargando && !error && equiposFiltrados.length === 0 && (
          <p className={styles.noData}>
            {busqueda
              ? "No se encontraron coincidencias con la búsqueda."
              : "Aún no has creado ningún equipo."}
          </p>
        )}

        {!cargando && !error && equiposFiltrados.length > 0 && (
          <div className={styles.cardsGrid}>
            {equiposFiltrados.map((equipo) => (
              <div className={styles.equipoCard} key={equipo.id_equipo}>
                <div>
                  <h3 className={styles.equipoTitle}>{equipo.nombre_equipo}</h3>

                  <div className={styles.dataContainer}>
                    <div className={styles.imgEquipo}>
                      <EscudoEquipo equipo={equipo} />
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
                    <Link
                      to={`/jugadoresEquipo/${equipo.id_equipo}`}
                      className={styles.btnVerJugadores}
                    >
                      Ver Jugadores
                    </Link>

                    <Link
                      to={`/equipos/editar/${equipo.id_equipo}`}
                      className={styles.btnEditar}
                    >
                      Editar
                    </Link>

                    <Link
                      to={`/equipos/eliminar/${equipo.id_equipo}`}
                      className={styles.btnDesactivar}
                    >
                      Desactivar
                    </Link>

                    <Link
                      to={`/inscripcionEquipos/crear/${equipo.id_equipo}`}
                      className={styles.btnInscribir}
                    >
                      Inscribir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}