import { useNavigate } from "react-router-dom";
import trofeo from "../../ASSETS/trofeo.jpg";
import styles from "./torneoCard.module.css";

export default function TorneoCard({ torneo, esOrganizador = true }) {
  const navigate = useNavigate();

  // Al dar clic en la tarjeta completa, va directo a gestionar los encuentros de ese torneo
  const handleCardClick = () => {
    navigate(`/torneo/${torneo.id_torneo}`);
  };

  const handleProgramar = (e) => {
    e.stopPropagation(); // Evita que se active el onClick de la tarjeta principal
    navigate(`/encuentros/torneo/${torneo.id_torneo}`);
  };

  const handleEditar = (e) => {
    e.stopPropagation();
    navigate(`/torneos/editar/${torneo.id_torneo}`);
  };

  const handleEliminar = (e) => {
    e.stopPropagation();
    navigate(`/torneos/eliminar/${torneo.id_torneo}`);
  };

  return (
    <div className={styles.torneoCard} onClick={handleCardClick}>
      <h2 className={styles.torneoTitle}>{torneo.nombre_torneo}</h2>

      <div className={styles.dataContainer}>
        <div className={styles.imgTorneo}>
          <img src={trofeo} alt="Logo del Torneo" />
        </div>

        <div className={styles.dataTorneo}>
          <p>
            <strong>Categoría:</strong>{" "}
            {torneo.nombre_categoria || "Sin categoría"}
            <br />
            <strong>Tipo:</strong> {torneo.tipo_torneo}
            <br />
            <strong>Ciudad:</strong> {torneo.ciudad}
            <br />
            <strong>Inicia:</strong> {torneo.fecha_inicio?.split("T")[0] || ""}
          </p>
        </div>
      </div>

      <div className={styles.footData}>
        <p className={styles.estado}>
          <strong>Estado: </strong> {torneo.estado}
        </p>

        {esOrganizador && (
          <div className={styles.acciones}>
            <button
              className={`${styles.btn} ${styles.btnEditar}`}
              onClick={handleEditar}
            >
              Editar
            </button>
            <button
              className={`${styles.btn} ${styles.btnEliminar}`}
              onClick={handleEliminar}
            >
              Desactivar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
