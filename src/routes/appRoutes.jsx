import { Routes, Route, Navigate } from "react-router-dom";
import { ROLES } from "../constants/roles";

// Vistas sin login
import Home from "../PAGES/Home";

import TorneoDetalle from "../PAGES/Torneo/torneoDetalle";
import NoAutorizado from "../PAGES/NoAutorizado";

// Login / Autenticación
import Login from "../PAGES/login/Login";
import Registrar from "../PAGES/login/Registrar";
import CodigoRegistro from "../PAGES/login/CodigoRegistro";
import RecuperarPassword from "../PAGES/login/RecuperarPassword";
import RestablecerPassword from "../PAGES/login/RestablecerPassword";
import CodigoRecuperacion from "../PAGES/login/CodigoRecuperacion";

// Layouts
import PublicLayout from "../layouts/publicLayout";
import PrivateLayout from "../layouts/privateLayout";
import ProtectedRoute from "../context/ProtectedRoute";

// Perfil y Configuración de Usuario
import Perfil from "../PAGES/Perfil";
import CambioCorreoPerfil from "../PAGES/CambioCorreoPerfil";
import CambioContraseñaPerfil from "../PAGES/CambioContraseñaPerfil";

// Usuarios
import Usuarios from "../PAGES/usuario/Usuarios";
import UsuarioCrear from "../PAGES/usuario/UsuarioCrear";
import UsuarioEditar from "../PAGES/usuario/UsuarioEditar";
import UsuarioEliminar from "../PAGES/usuario/UsuarioEliminar";

// Torneos
import Torneos from "../PAGES/Torneo/Torneos";
import TorneosAdmin from "../PAGES/Torneo/TorneosAdmin";
import TorneoCrear from "../PAGES/Torneo/TorneoCrear";
import TorneoEditar from "../PAGES/Torneo/TorneoEditar";
import TorneoEliminar from "../PAGES/Torneo/TorneoEliminar";
import TorneoDetalleJugador from "../PAGES/Torneo/TorneoDetallejugador";
import TorneosOrganizador from "../PAGES/Torneo/TorneosOrganizador";

// Categorias
import CategoriasAdmin from "../PAGES/Categorias/CategoriasAdmin";
import CategoriasAdminCrear from "../PAGES/Categorias/CategoriasAdminCrear";
import CategoriasEditar from "../PAGES/Categorias/CategoriasEditar";

// Inscripciones de equipos
import InscripcionesEquipos from "../PAGES/InscripcionesEquipo/inscripcionesEquipos";
import InscripcionesEquiposCrear from "../PAGES/InscripcionesEquipo/inscripcionesEquiposCrear";
import InscripcionesEquiposEditar from "../PAGES/InscripcionesEquipo/inscripcionesEquiposEditar";
import InscripcionesEquiposEliminar from "../PAGES/InscripcionesEquipo/inscripcionesEquiposEliminar";
import InscripcionesEquiposOrganizador from "../PAGES/InscripcionesEquipo/InscripcionesEquiposOrganizador";
import InscripcionesEquiposOrganizadorCrear from "../PAGES/InscripcionesEquipo/inscripcionesEquiposOrganizadorCrear";
import InscripcionesEquiposAdmin from "../PAGES/InscripcionesEquipo/InscripcionesEquiposAdmin";

// Equipos
import Equipos from "../PAGES/Equipos/Equipos";
import EquipoCrear from "../PAGES/Equipos/EquipoCrear";
import EquipoEditar from "../PAGES/Equipos/EquipoEditar";
import EquipoEliminar from "../PAGES/Equipos/EquipoEliminar";
import EquiposAdmin from "../PAGES/Equipos/EquiposAdmin";
import MisEquipos from "../PAGES/Equipos/MisEquipos";

// Jugadores
import Jugadores from "../PAGES/Jugadores/Jugadores";
import JugadorCrear from "../PAGES/Jugadores/JugadorCrear";
import JugadorEditar from "../PAGES/Jugadores/JugadorEditar";
import JugadorEliminar from "../PAGES/Jugadores/JugadorEliminar";
import JugadoresEquipo from "../PAGES/Jugadores/JugadoresEquipo";
import MiFicha from "../PAGES/Jugadores/MiFicha";
import MiEquipo from "../PAGES/Jugadores/MiEquipo";
import JugadoresAdmin from "../PAGES/Jugadores/JugadoresAdmin";

// Encuentros
import Encuentros from "../PAGES/Encuentros/Encuentros";
import EncuentrosAdmin from "../PAGES/Encuentros/EncuentrosAdmin";
import EncuentrosCrear from "../PAGES/Encuentros/EncuentrosCrear";
import EncuentrosEditar from "../PAGES/Encuentros/EncuentrosEditar";
import EncuentrosEliminar from "../PAGES/Encuentros/EncuentrosEliminar";
import EncuentroReprogramar from "../PAGES/Encuentros/EncuentroReprogramar";
import EncuentrosOrganizador from "../PAGES/Encuentros/EncuentrosOrganizador";
import EncuentrosList from "../PAGES/Encuentros/EncuentrosList";
import MisEncuentrosVeedor from "../PAGES/Encuentros/MisEncuentrosVeedor";
import HistorialEncuentrosVeedor from "../PAGES/Encuentros/HistorialEncuentrosVeedor";

// Cronologias
import Cronologias from "../PAGES/Cronologias/Cronologias";
import CronologiasOrganizador from "../PAGES/Cronologias/CronologiasOrganizador";
import CronologiasCrear from "../PAGES/Cronologias/CronologiasCrear";
import CronologiasEditar from "../PAGES/Cronologias/CronologiasEditar";
import CronologiasEliminar from "../PAGES/Cronologias/CronologiasEliminar";

// Resultados
import Resultados from "../PAGES/Resultados/Resultados";
import ResultadosCrear from "../PAGES/Resultados/ResultadosCrear";
import ResultadosEditar from "../PAGES/Resultados/ResultadosEditar";
import ResultadosEliminar from "../PAGES/Resultados/ResultadosEliminar";
import ResultadoDetalle from "../PAGES/Resultados/ResultadoDetalle";
import ResultadoVeedor from "../PAGES/Resultados/ResultadoVeedor";

// Posiciones
import Posiciones from "../PAGES/Posiciones/Posiciones";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLICAS */}
      <Route element={<PublicLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/torneo/:id" element={<TorneoDetalle />} />
        <Route path="/equipos" element={<Equipos />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registrar />} />
        <Route path="/codigo-registro" element={<CodigoRegistro />} />
        <Route path="/codigo-recuperacion" element={<CodigoRecuperacion />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/restablecer-password" element={<RestablecerPassword />} />
      </Route>

      {/* RUTA DE ACCESO DENEGADO */}
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* PRIVADAS */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          {/* Perfil accesible por cualquier usuario autenticado */}
          <Route path="/perfil" element={<Perfil />} />
          <Route
            path="/perfil/codigo-cambio-correo"
            element={<CambioCorreoPerfil />}
          />
          <Route
            path="/perfil/cambio-contraseña-perfil"
            element={<CambioContraseñaPerfil />}
          />

          {/* Rutas exclusivas ADMINISTRADOR */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMINISTRADOR, ROLES.SUPERADMINISTRADOR]}
              />
            }
          >
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/crear" element={<UsuarioCrear />} />
            <Route path="/usuarios/editar/:id" element={<UsuarioEditar />} />
            <Route
              path="/usuarios/eliminar/:id"
              element={<UsuarioEliminar />}
            />
            <Route path="/torneos/gestion" element={<TorneosAdmin />} />

            <Route path="/categorias" element={<CategoriasAdmin />} />
            <Route path="/equipos/admin" element={<EquiposAdmin />} />
            <Route path="/jugadores/admin" element={<JugadoresAdmin />} />
            <Route
              path="/inscripcionEquipos/admin"
              element={<InscripcionesEquiposAdmin />}
            />
          </Route>

          {/* Rutas exclusivas ORGANIZADOR */}
          <Route
            element={<ProtectedRoute allowedRoles={[ROLES.ORGANIZADOR]} />}
          >
            <Route path="/torneos/mios" element={<TorneosOrganizador />} />
          </Route>

          {/* Rutas exclusivas ORGANIZADOR */}
          <Route
            element={<ProtectedRoute allowedRoles={[ROLES.ENTRENADOR]} />}
          >
            <Route path="/equipos/mios" element={<MisEquipos />} />
          </Route>

          {/* Rutas ADMINISTRADOR u ORGANIZADOR */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.ADMINISTRADOR,
                  ROLES.ORGANIZADOR,
                  ROLES.VEEDOR,
                  ROLES.SUPERADMINISTRADOR,
                ]}
              />
            }
          >
            <Route path="/cronologias" element={<Cronologias />} />
            <Route path="/cronologias/Crear" element={<CronologiasCrear />} />
            <Route
              path="/cronologias/Editar/:id"
              element={<CronologiasEditar />}
            />
            <Route
              path="/cronologias/Eliminar/:id"
              element={<CronologiasEliminar />}
            />
            <Route
              path="/cronologias/:id"
              element={<CronologiasOrganizador />}
            />

            <Route path="/torneos/crear" element={<TorneoCrear />} />
            <Route path="/torneos/editar/:id" element={<TorneoEditar />} />
            <Route path="/torneos/eliminar/:id" element={<TorneoEliminar />} />
          </Route>

          {/* Rutas compartidas: ENTRENADOR, ADMINISTRADOR, ORGANIZADOR, JUGADOR */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.ENTRENADOR,
                  ROLES.ADMINISTRADOR,
                  ROLES.ORGANIZADOR,
                  ROLES.VEEDOR,
                  ROLES.JUGADOR,
                  ROLES.SUPERADMINISTRADOR,
                ]}
              />
            }
          >
            {/* Torneos */}
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/torneos/:id_torneo" element={<Torneos />} />
            <Route
              path="/torneoJugador/:id"
              element={<TorneoDetalleJugador />}
            />

            {/* Rutas de Categorías */}
            <Route path="/categorias" element={<CategoriasAdmin />} />
            <Route
              path="/categorias/crear"
              element={<CategoriasAdminCrear />}
            />
            <Route
              path="/categorias/editar/:id_categoria"
              element={<CategoriasEditar />}
            />

            {/* Inscripciones de equipos */}
            <Route
              path="/inscripcionEquipos"
              element={<InscripcionesEquipos />}
            />

            <Route
              path="/inscripcionEquipos/torneo/:id_torneo"
              element={<InscripcionesEquipos />}
            />

            <Route
              path="/inscripcionEquipos/crear/:idEquipo"
              element={<InscripcionesEquiposCrear />}
            />

            <Route
              path="/inscripcionEquiposOrganizador/crear/:id_torneo"
              element={<InscripcionesEquiposOrganizadorCrear />}
            />

            <Route
              path="/inscripcionEquipos/editar/:id"
              element={<InscripcionesEquiposEditar />}
            />

            <Route
              path="/inscripcionEquipos/eliminar/:id"
              element={<InscripcionesEquiposEliminar />}
            />

            {/* Equipos */}
            <Route path="/equipos/crear" element={<EquipoCrear />} />
            <Route path="/equipos/editar/:id" element={<EquipoEditar />} />
            <Route path="/equipos/eliminar/:id" element={<EquipoEliminar />} />

            {/* Jugadores */}
            <Route path="/jugadores" element={<Jugadores />} />
            <Route
              path="/jugadoresEquipo/:idEquipo"
              element={<JugadoresEquipo />}
            />
            <Route
              path="/jugadores/crear/:idEquipo"
              element={<JugadorCrear />}
            />
            <Route path="/jugadores/editar/:id" element={<JugadorEditar />} />
            <Route
              path="/jugadores/eliminar/:id"
              element={<JugadorEliminar />}
            />

            {/* Encuentros */}
            <Route path="/encuentros" element={<EncuentrosList />} />
            <Route path="/encuentros/:id_torneo" element={<EncuentrosList />} />
            <Route path="/encuentros/admin" element={<EncuentrosAdmin />} />
            <Route path="/encuentros/Crear" element={<EncuentrosCrear />} />
            <Route
              path="/encuentros/Crear/:id_torneo"
              element={<EncuentrosCrear />}
            />
            <Route
              path="/encuentros/Editar/:id"
              element={<EncuentrosEditar />}
            />
            <Route
              path="/encuentros/Eliminar/:id"
              element={<EncuentrosEliminar />}
            />
            <Route
              path="/encuentros/reprogramar/:id"
              element={<EncuentroReprogramar />}
            />
            <Route
              path="/encuentros/torneo/:id"
              element={<EncuentrosOrganizador />}
            />
            <Route
              path="/torneos/:id/Encuentros"
              element={<EncuentrosOrganizador />}
            />
            <Route
              path="/veedor/mis-encuentros"
              element={<MisEncuentrosVeedor />}
            />

            <Route
              path="/veedor/historial-encuentros"
              element={<HistorialEncuentrosVeedor />}
            />

            {/* Resultados */}
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/resultados/Crear" element={<ResultadosCrear />} />
            <Route
              path="/resultados/Editar/:id"
              element={<ResultadosEditar />}
            />
            <Route
              path="/resultados/Eliminar/:id"
              element={<ResultadosEliminar />}
            />
            <Route path="/resultado/:id" element={<ResultadoDetalle />} />
            <Route
              path="/resultado/encuentro/:id"
              element={<ResultadoVeedor />}
            />

            {/* Posiciones */}
            <Route path="/posiciones" element={<Posiciones />} />
          </Route>

          {/* Exclusivo para rol Jugador */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.JUGADOR]} />}>
            <Route path="/mi-ficha" element={<MiFicha />} />
            <Route path="/mi-equipo" element={<MiEquipo />} />
          </Route>
        </Route>
      </Route>

      {/* RUTA POR DEFECTO / WILDCARD */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}