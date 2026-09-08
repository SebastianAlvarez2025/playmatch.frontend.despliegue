import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import "../styles/estilosComponents/sidebar.css";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const rolActual = user ? Number(user.rol) : ROLES.INVITADO; // Asignar INVITADO si user o user.rol es undefined

  const rolNombre = {
    0: "Invitado",
    1: "Administrador",
    2: "Organizador",
    3: "Jugador",
    5: "Director Técnico",
    8: "Veedor",
    10: "Arbitro",
    11: "Super administrador",
  };

  // Menú agrupado por secciones
  const secciones = [
    {
      label: "General",
      items: [
        {
          roles: [
            ROLES.ADMINISTRADOR,
            ROLES.ORGANIZADOR,
            ROLES.JUGADOR,
            ROLES.ENTRENADOR,
            ROLES.VEEDOR,
            ROLES.SUPERADMINISTRADOR,
          ],
          label: "Inicio",
          path: "/home",
          icon: "🏠",
        },
        {
          roles: [ROLES.ADMINISTRADOR, ROLES.SUPERADMINISTRADOR],
          label: "Usuarios",
          path: "/usuarios",
          icon: "👥",
        },
        {
          // RF-003: el Jugador consulta su propia ficha (solo lectura)
          roles: [ROLES.JUGADOR],
          label: "Mi Ficha",
          path: "/mi-ficha",
          icon: "🪪",
        },
        {
          // NUEVO: el Jugador consulta la plantilla completa de
          // su equipo (solo sus compañeros, sin torneos ni nada más)
          roles: [ROLES.JUGADOR],
          label: "Plantilla",
          path: "/mi-equipo",
          icon: "🛡️",
        },
      ],
    },
    {
      // Sección exclusiva del Director Técnico
      label: "Mi Equipo",
      items: [
        {
          roles: [ROLES.ENTRENADOR],
          label: "Jugadores",
          path: "/jugadores",
          icon: "🏃",
        },
        {
          roles: [ROLES.ENTRENADOR],
          label: "Inscripción de Equipos",
          path: "/inscripcionEquipos",
          icon: "📋",
        },
      ],
    },
    {
      label: "Torneos y Equipos",
      items: [
        {
          roles: [
            ROLES.ADMINISTRADOR,
            ROLES.ORGANIZADOR,
            ROLES.ENTRENADOR,
            ROLES.SUPERADMINISTRADOR,
            ROLES.JUGADOR,
            ROLES.VEEDOR,
          ],
          label: "Torneos",
          path: "/torneos",
          icon: "🏆",
        },
        {
          roles: [ROLES.ADMINISTRADOR, ROLES.SUPERADMINISTRADOR],
          label: "Categorias",
          path: "/categorias",
          icon: "🥇",
        },
        {
          roles: [ROLES.ADMINISTRADOR,
            ROLES.SUPERADMINISTRADOR,
            ROLES.ENTRENADOR,
            ROLES.ORGANIZADOR,
            ROLES.JUGADOR,
            ROLES.VEEDOR],
          label: "Equipos",
          path: "/equipos",
          icon: "🛡️",
        },
        {
          roles: [ROLES.ADMINISTRADOR, ROLES.SUPERADMINISTRADOR],
          label: "Jugadores",
          path: "/jugadores/admin",
          icon: "🏃",
        },
        {
          roles: [ROLES.ADMINISTRADOR, ROLES.SUPERADMINISTRADOR],
          label: "Inscripción de Equipos",
          path: "/inscripcionEquipos/admin",
          icon: "📋",
        },
        {
          roles: [ROLES.VEEDOR],
          label: "Mis Encuntros",
          path: "/veedor/mis-encuentros",
          icon: "📋",
        },
        {
          roles: [ROLES.VEEDOR],
          label: "Historial Encuntros",
          path: "/veedor/historial-encuentros",
          icon: "🕘",
        },
      ],
    },
  ];

  return (
    <aside className="sidebar">
    
      <div className="sidebar-topbar">{rolNombre[rolActual] || "Sin rol"}</div>

      <ul className="sidebar-menu">
        {secciones.map((seccion) => {
          const itemsFiltrados = seccion.items.filter((item) =>
            item.roles.includes(rolActual),
          );

          if (itemsFiltrados.length === 0) return null;

          return (
            <li key={seccion.label}>
              <div className="sidebar-section-label">{seccion.label}</div>
              <ul style={{ listStyle: "none" }}>
                {itemsFiltrados.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}