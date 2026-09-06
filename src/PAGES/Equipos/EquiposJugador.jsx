import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import {
  getEquiposByTorneo,
  getEquipoJugadorByUsuario,
  deleteEquipo,
} from "../../services/equiposService";

import escudo from "../../ASSETS/escudo.jpg";

import "../../styles/estilosPages/equipos/equipos.css";
import "../../styles/estilosPages/torneoCard.css";

export default function Equipos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [equipos, setEquipos] = useState([]);
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        if (id) {
          // Organizador/Admin: equipos del torneo
          const data = await getEquiposByTorneo(id);
          setEquipos(data || []);
        } else if (user?.id_usuario) {
          // Jugador: su equipo
          const data = await getEquipoJugadorByUsuario(user.id_usuario);
          setEquipo(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, user]);

  if (loading) {
    return (
      <div className="torneos-container">
        <p>Cargando...</p>
      </div>
    );
  }

  if (id) {
    return (
      <div className="equipos-container">
        <div className="header-equipos">
          <h2 className="titulo-equipos">Equipos Inscritos</h2>

          <button
            className="btn-inscribir-equipo"
            onClick={() =>
              navigate(`/inscripcionEquiposOrganizador/crear/${id}`)
            }
          >
            + Inscribir Equipo
          </button>
        </div>

        {equipos.length === 0 ? (
          <div className="empty-state">
            <h3>No hay equipos inscritos</h3>
            <p>Aún no hay equipos en este torneo.</p>
          </div>
        ) : (
          <div className="grid-equipos">
            {equipos.map((e) => (
              <div
                className="equipo-card"
                key={e.id_equipo}
                onClick={() => navigate(`/jugadoresEquipo/${e.id_equipo}`)}
              >
                <div className="equipo-id">
                  <span>#{e.id_equipo}</span>
                </div>

                <div className="equipo-logo">
                  <img src={escudo} alt={e.nombre_equipo} />
                </div>

                <div className="equipo-info">
                  <h3>{e.nombre_equipo}</h3>
                  <p>{e.nombre_usuario}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="header-torneos">
        <h2>Mi Equipo</h2>

        {!equipo && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-crear"
              onClick={() => navigate("/jugadores/crear")}
            >
              Crear Jugador
            </button>

            <button
              className="btn-crear"
              onClick={() => navigate("/equipos/crear")}
            >
              Crear Equipo
            </button>
          </div>
        )}
      </div>

      <div className="torneos-container">
        {equipo ? (
          <div
            className="torneo-card"
            onClick={() => navigate(`/jugadoresEquipo/${equipo.id_equipo}`)}
            style={{ cursor: "pointer" }}
          >
            <h3 className="torneo-title">{equipo.nombre_equipo}</h3>

            <h4>ID: {equipo.id_equipo}</h4>

            <div className="data-container">
              <div className="img-torneo">
                <img src={escudo} alt={equipo.nombre_equipo} />
              </div>

              <div className="data-torneo">
                <p>
                  <strong>Jugador:</strong> {equipo.nombre_usuario}
                </p>

                <p>
                  <strong>Estado:</strong> {equipo.estado}
                </p>

                <div className="foot-data">
                  <button
                    className="btn-solicitudes"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/equipo/${equipo.id_equipo}/solicitudes`);
                    }}
                  >
                    Solicitudes
                  </button>

                  <button
                    className="btn-ver-jugadores"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jugadoresEquipo/${equipo.id_equipo}`);
                    }}
                  >
                    Ver Jugadores
                  </button>

                  <button
                    className="btn-ver-torneo"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/torneoJugador/${equipo.id_torneo}`);
                    }}
                  >
                    Ver Torneo
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                className="btn-eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarEquipo(equipo.id_equipo);
                }}
              >
                Eliminar
              </button>

              <button
                className="btn-editar"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/equipos/editar/${equipo.id_equipo}`);
                }}
              >
                Editar
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h2>No perteneces a ningún equipo</h2>

            <p>Aún no estás inscrito como jugador en ningún equipo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
