import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCronologias } from "../../services/cronologiasService";
import "../../styles/estilosPages/cronologias/cronologias.css";
import Pagination from "../../components/Pagination";

export default function CronologiasAdmin() {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const [cronologias, setCronologias] = useState([]);

  const cargarCronologias = async () => {
    try {
      const data = await getCronologias();
      setCronologias(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarCronologias();
  }, []);

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;

  const cronologiasPaginadas = cronologias.slice(
    primerRegistro,
    ultimoRegistro
  );

  return (
    <div className="usuarios-container">
      <div className="tabla-container">
        <div className="header-tabla">
          <h2 className="titulo">Cronologías</h2>

          <button
            className="btn crear"
            onClick={() => navigate("/cronologias/crear")}
          >
            Crear
          </button>
        </div>

        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Encuentro</th>
              <th>Encuentro</th>
              <th>Equipo</th>
              <th>Jugador</th>
              <th>Evento</th>
              <th>Minuto</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cronologias.length > 0 ? (
              cronologiasPaginadas.map((c) => (
                <tr key={c.id_cronologia}>
                  <td>{c.id_cronologia}</td>
                  <td>{c.id_encuentro}</td>
                  <td>
                    {c.equipo_local} vs {c.equipo_visitante}
                  </td>
                  <td>{c.equipo_jugador}</td>

                  <td>
                    {c.nombre_usuario} {c.apellido_usuario}
                  </td>

                  <td>{c.evento}</td>

                  <td>{c.minuto}'</td>

                  <td className="acciones">
                    <button
                      className="btn editar"
                      onClick={() =>
                        navigate(`/cronologias/editar/${c.id_cronologia}`)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn eliminar"
                      onClick={() =>
                        navigate(`/cronologias/eliminar/${c.id_cronologia}`)
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* Corregido a colSpan="8" porque tienes exactamente 8 columnas en el thead */}
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No hay cronologías
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          totalRegistros={cronologias.length}
          registrosPorPagina={registrosPorPagina}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
        />

      </div>
    </div>
  );
}