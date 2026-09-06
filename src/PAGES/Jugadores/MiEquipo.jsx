// ===================================================================
// MiEquipo.jsx
// RF-003 — Actor: Jugador → "Plantilla" (solo lectura)
//
// Muestra la lista de jugadores (compañeros) del equipo del Jugador
// logueado, cada uno como una ficha individual (mismo estilo visual
// que la tarjeta de perfil de "Mi Ficha"), en vez de texto plano.
// Sin torneos, sin encuentros, sin resultados: solo la plantilla.
// ===================================================================

import { useEffect, useState } from "react";

import { getMiFicha, getJugadoresPorEquipo } from "../../services/jugadoresService";

import "../../styles/estilosPages/jugadores/jugadores.css";

// ----------------------------------------------------------------
// FUNCIÓN: infoTarjeta
// Misma lógica que en MiFicha.jsx: traduce el ENUM de tarjetas
// ('amarillas' | 'azules' | 'rojas' | '') a emoji + texto legible.
// ----------------------------------------------------------------
function infoTarjeta(valor) {
  switch (valor) {
    case "amarillas":
      return { emoji: "🟨", texto: "Amarilla" };
    case "rojas":
      return { emoji: "🟥", texto: "Roja" };
    case "azules":
      return { emoji: "🟦", texto: "Azul" };
    default:
      return { emoji: "▫️", texto: "Ninguna" };
  }
}

export default function MiEquipo() {
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPlantilla = async () => {
    try {
      setCargando(true);
      setError("");

      // 1. Traemos la ficha del Jugador logueado, solo para
      //    saber a qué equipo pertenece (id_equipo, nombre_equipo)
      const miFicha = await getMiFicha();

      setNombreEquipo(miFicha?.nombre_equipo || "");

      if (miFicha?.id_equipo) {
        // 2. Traemos todos los jugadores de ese equipo
        const listaJugadores = await getJugadoresPorEquipo(miFicha.id_equipo);
        setJugadores(listaJugadores || []);
      }
    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 404) {
        setError(
          err.response.data?.msg ||
            "Aún no tienes una ficha de jugador registrada."
        );
      } else {
        setError("No se pudo cargar la plantilla de tu equipo.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlantilla();
  }, []);

  if (cargando) return <p className="mificha-vacio">Cargando...</p>;
  if (error) return <p className="mificha-vacio">{error}</p>;

  return (
    <div className="plantilla-container">
      <h1 className="mificha-titulo">Plantilla</h1>
      <p className="mificha-subtitulo">
        Jugadores registrados en {nombreEquipo || "tu equipo"}.
      </p>

      {jugadores.length === 0 ? (
        <p className="mificha-vacio">
          No hay jugadores registrados en este equipo.
        </p>
      ) : (
        <div className="plantilla-grid">
          {jugadores.map((j) => {
            const tarjeta = infoTarjeta(j.tarjetas);

            return (
              <div key={j.id_jugador} className="plantilla-ficha">
                <div className="plantilla-ficha-avatar">
                  <span>{j.numero_camiseta}</span>
                </div>

                <h3 className="plantilla-ficha-nombre">
                  {j.nombre_usuario} {j.apellido_usuario}
                </h3>

                <div className="plantilla-ficha-datos">
                  <div className="mificha-dato-fila">
                    <span>⚽ Goles</span>
                    <span>{j.goles}</span>
                  </div>
                  <div className="mificha-dato-fila">
                    <span>{tarjeta.emoji} Tarjeta</span>
                    <span>{tarjeta.texto}</span>
                  </div>
                  <div className="mificha-dato-fila">
                    <span># Camiseta</span>
                    <span>{j.numero_camiseta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}