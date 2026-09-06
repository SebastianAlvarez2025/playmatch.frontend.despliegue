import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTorneos } from "../../services/torneoService";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";
import styles from "./TorneosJugador.module.css"; // 👈 CSS Modular conectado
import trofeo from "../../ASSETS/trofeo.jpg";
import TorneosOrganizador from "./TorneosOrganizador";

export default function TorneosJugador() {
  const [torneos, setTorneos] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const admin = Number(user?.rol) === ROLES.SUPERADMINISTRADOR || Number(user?.rol) === ROLES.ADMINISTRADOR;
  const organizador = Number(user?.rol) === ROLES.ORGANIZADOR;

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getTorneos();
        setTorneos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    };

    cargar();
  }, []);

  // 🛠️ Función segura para formatear la fecha de inicio
  const formatFecha = (fechaRaw) => {
    if (!fechaRaw) return "Sin fecha";
    try {
      const fecha = fechaRaw.split("T")[0];
      return fecha.split("-").reverse().join("-");
    } catch {
      return "Fecha inválida";
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };


  const filtrados = torneos.filter(
    (t) =>
      (t.nombre_torneo || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.nombre_usuario || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.apellido_usuario || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.nombre_categoria || "").toLowerCase().includes(search.toLowerCase()) || 
      (t.tipo_torneo || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.ciudad || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.fecha_inicio || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.fecha_fin || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.estado || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.torneosContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.torneosHeader}>
          <h2 className={styles.titulo}>Torneos</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                id="buscar_torneo"
                type="text"
                placeholder="Buscar torneo..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            
            {admin && (
              <button
                className={`${styles.btn} ${styles.btnGestionar}`}
                onClick={() => navigate("/torneos/gestion")}
              >
                ⚙ Gestionar torneos
              </button>
            )}

            {organizador && (
              <button
                className={`${styles.btn} ${styles.btnGestionar}`}
                onClick={() => navigate("/torneos/mios")}
              >
                ⚙ Mis torneos
              </button>
            )}
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {filtrados.length > 0 ? (
            filtrados.map((t) => (
              <div
                key={t.id_torneo}
                className={styles.torneoCard}
                onClick={() => navigate(`/torneo/${t.id_torneo}`)}
              >
                <div>
                  <h3 className={styles.torneoTitle}>{t.nombre_torneo}</h3>

                  <div className={styles.dataContainer}>
                    <div className={styles.imgTorneo}>
                      <img src={trofeo} alt="Torneo" />
                    </div>

                    <div className={styles.dataTorneo}>
                      <p>
                        <strong>Tipo:</strong> {t.tipo_torneo}
                        <br />
                        <strong>Ciudad:</strong> {t.ciudad}
                        <br />
                        <strong>Inicio:</strong> {formatFecha(t.fecha_inicio)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.footData}>
                  <p className={styles.estado}>
                    <strong>Estado:</strong> {t.estado}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noData}>No hay torneos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}