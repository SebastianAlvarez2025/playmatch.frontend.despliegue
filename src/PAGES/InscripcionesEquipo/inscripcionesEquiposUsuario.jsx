import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/estilosPages/encuentros/encuentros.css";

const API = import.meta.env.VITE_API_URL + "/inscripcionEquipos";

export default function InscripcionesEquiposOrganizador({ id_torneo }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("Pendiente");

  const navigate = useNavigate();

  const getInscripciones = async () => {
    try {
      setLoading(true);

      const res = await fetch(API);
      const data = await res.json();

      setInscripciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInscripciones();
  }, []);

  const filtrados = inscripciones.filter(
    (i) => String(i.id_torneo) === String(id_torneo) && i.estado === filtro,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Inscripciones del torneo</h2>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && filtrados.length === 0 && (
        <p>No hay inscripciones para este filtro</p>
      )}

      {filtrados.map((inscripcion) => (
        <div
          key={inscripcion.id_inscripcion_e}
          className="encuentro-card"
          style={{ marginBottom: "15px" }}
        >
          <div className="partido">
            <span className="equipo-e">{inscripcion.nombre_torneo}</span>

            <span className="equipo-e">{inscripcion.nombre_equipo}</span>

            <div className="tiempo-partido">Estado</div>

            <div className="equipo-e">{inscripcion.estado}</div>
          </div>

          <div className="lugar-e">
            Fecha inscripción:{" "}
            {new Date(inscripcion.fecha_ins_equipo).toLocaleDateString("es-CO")}
          </div>
        </div>
      ))}
    </div>
  );
}
