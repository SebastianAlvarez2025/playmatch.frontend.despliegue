import { useContext, useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/estilosPages/home.css";

const IMAGENES_DEFAULT = [
  "/torneosDestacados/1.jpg",
  "/torneosDestacados/2.jpg",
  "/torneosDestacados/3.jpg",
  
];

const formatearFecha = (fechaString) => {
  if (!fechaString) return { dia: "--", mes: "---", anio: "----" };
  
  // Reemplazamos guiones para evitar desfases de zona horaria
  const fecha = new Date(fechaString.includes("T") ? fechaString : fechaString.replace(/-/g, "/"));

  if (isNaN(fecha.getTime())) return { dia: "--", mes: "---", anio: "----" };

  return {
    dia: fecha.getDate(),
    mes: fecha.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
    anio: fecha.getFullYear()
  };
};

export default function Home() {

  const { user } = useContext(AuthContext);

  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Referencia para la sección de características
  const caracteristicasRef = useRef(null);

  // 2. Función para deslizar suavemente
  const scrollToCaracteristicas = () => {
    caracteristicasRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const obtenerTorneos = async () => {
  try {
    setLoading(true);
    const response = await api.get("/torneos");

    
    const finalizados = response.data.filter(
      (torneo) => torneo.estado?.toLowerCase() === "finalizado"
    );

    
    const ordenados = finalizados.sort((a, b) => b.id - a.id);

    
    const ultimosTres = ordenados.slice(0, 3);

    setTorneos(ultimosTres);
  } catch (error) {
    console.error("Error obteniendo torneos:", error);
    setError("No se pudieron cargar los torneos");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    obtenerTorneos();
  }, []);

  

  return (
    <div className="home-container">

      {/* =========================
          HERO
      ========================= */}
      <section className="hero">

        <div className="hero-content">

          <span className="hero-tag">
            Organiza. Compite. Disfruta.
          </span>

          <h1>
            Bienvenido a
            <span> PlayMatch</span>
          </h1>

          <p className="hero-description">
            La plataforma para gestionar torneos de fútbol,
            administrar equipos, registrar jugadores y seguir
            cada partido desde un solo lugar.
          </p>

          <div className="hero-buttons">

              {!user && (
              <Link to="/registro" className="btn-primary">
              Inscribe tu equipo
            </Link>
            )}
            {/* Evento onClick agregado para hacer el scroll */}
            <button className="btn-secondary" onClick={scrollToCaracteristicas}>
              Conoce más
              <span> ⓘ </span>
            </button>

          </div>

        </div>

        <div className="hero-overlay"></div>

      </section>


      {/* =========================
          ESTADÍSTICAS
      ========================= */}
      <section className="stats">

        <div className="stat">
          <span className="stat-icon">🏆</span>
          <div>
            <strong>+50</strong>
            <p>Torneos organizados</p>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon">👥</span>
          <div>
            <strong>+150</strong>
            <p>Equipos inscritos</p>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon">⚽</span>
          <div>
            <strong>+600</strong>
            <p>Jugadores registrados</p>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon">📊</span>
          <div>
            <strong>98%</strong>
            <p>Satisfacción</p>
          </div>
        </div>

      </section>


      {/* =========================
          TORNEOS RECIENTES
      ========================= */}
      <section className="tournaments-section">

        <div className="section-header">
          <div>
            <span className="section-icon">🏆</span>
            <h2>Torneos destacados</h2>
          </div>
        </div>

        <div className="tournaments-grid">

          {Array.isArray(torneos) && torneos.map((torneo, index) => (
            <article
              className="tournament-card"
              key={torneo.id || index}
            >
              <div className="tournament-image">
                <img
                  src={torneo.imagen || IMAGENES_DEFAULT[index % IMAGENES_DEFAULT.length]}
                  alt={torneo.nombre_torneo || "Torneo"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = IMAGENES_DEFAULT[index % IMAGENES_DEFAULT.length];
                  }}
                />

                <span
                  className={`tournament-status ${
                    torneo.estado === "En curso"
                      ? "status-active"
                      : "status-finished"
                  }`}
                >
                  {torneo.estado}
                </span>

                <div className="tournament-date">
                    <strong>{formatearFecha(torneo.fecha_fin).dia}</strong>
                    <span style={{ textTransform: "capitalize" }}>
                        {formatearFecha(torneo.fecha_fin).mes}
                    </span>
                    <small>{formatearFecha(torneo.fecha_fin).anio}</small>
                </div>

              </div>


              {/* INFORMACIÓN */}
              <div className="tournament-content">

                <h3>
                  🏆 {torneo.nombre_torneo}
                </h3>

                <div className="tournament-info">

                  <span>
                    📋 {torneo.tipo_torneo}
                  </span>

                  <span>
                    📍 {torneo.ciudad}
                  </span>

                   <span>
                    👥 {torneo.estado} 
                  </span>

                </div>


                {/* TORNEO EN CURSO */}
                {torneo.estado === "En curso" && (

                  <div className="tournament-progress">

                    <div className="progress-header">
                      <span>Progreso</span>

                      <strong>
                        {torneo.progreso}%
                      </strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        style={{
                          width: `${torneo.progreso}%`,
                        }}
                      ></div>
                    </div>

                  </div>

                )}


                {/* TORNEO FINALIZADO */}
                {torneo.estado === "Finalizado" && (
                  
                  <div className="tournament-champion">

                    <div>
                      
                      <strong>
                        {torneo.campeon}
                      </strong>
                    </div>

                  </div>
                   
                )}

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* =========================
          CARACTERÍSTICAS (ref vinculada aquí)
      ========================= */}
      <section className="features" ref={caracteristicasRef}>
        <h2>¿Qué puedes hacer en PlayMatch?</h2>

        <div className="cards">

          <div className="card">
            <div className="icon">🏆</div>
            <h3>Administrar torneos</h3>
            <p>
              Crea torneos, configura sus encuentros y administra todo el desarrollo
              de la competencia.
            </p>
          </div>

          <div className="card">
            <div className="icon">👥</div>
            <h3>Gestionar equipos</h3>
            <p>
              Registra equipos, administra su información y controla su
              participación en los torneos.
            </p>
          </div>

          <div className="card">
            <div className="icon">⚽</div>
            <h3>Administrar jugadores</h3>
            <p>
              Mantén organizada la información de los jugadores pertenecientes a
              cada equipo.
            </p>
          </div>

          <div className="card">
            <div className="icon">📅</div>
            <h3>Programar encuentros</h3>
            <p>
              Organiza el calendario de partidos y consulta la programación de
              cada jornada.
            </p>
          </div>

          <div className="card">
            <div className="icon">📊</div>
            <h3>Resultados y posiciones</h3>
            <p>
              Registra marcadores y consulta automáticamente la tabla de
              posiciones del torneo.
            </p>
          </div>

          <div className="card">
            <div className="icon">🏃</div>
            <h3>Jugadores y equipo</h3>
            <p>
              Inscribete para dar la máxima calidad en un equipo y participa en los mejores
              torneos de fútbol.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}