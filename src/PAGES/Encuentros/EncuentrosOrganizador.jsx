import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEncuentrosByTorneo,
  generarFixtureAutomatico,
  deleteEncuentro,
  asignarVeedor,
} from "../../services/encuentrosService";

import { getVeedores } from "../../services/usuariosService";

import styles from "./EncuentrosOrganizador.module.css";

export default function Encuentros() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [encuentros, setEncuentros] = useState([]);
  const [veedores, setVeedores] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // CARGAR ENCUENTROS
  // ==========================================================

  const cargarEncuentros = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getEncuentrosByTorneo(id);

      setEncuentros(data || []);
    } catch (error) {
      console.error("Error al cargar los encuentros:", error);
    }
  }, [id]);

  // ==========================================================
  // CARGAR VEEDORES
  // ==========================================================

  const cargarVeedores = useCallback(async () => {
    try {
      const data = await getVeedores();
      setVeedores(data || []);
    } catch (error) {
      console.error("Error al cargar los veedores:", error);
    }
  }, []);

  // ==========================================================
  // CARGA INICIAL
  // ==========================================================

  useEffect(() => {
    cargarEncuentros();
    cargarVeedores();
  }, [cargarEncuentros, cargarVeedores]);

  // ==========================================================
  // GENERAR FIXTURE
  // ==========================================================

  const handleGenerarFixture = async () => {
    try {
      setLoading(true);

      const res = await generarFixtureAutomatico({
        id_torneo: id,
      });

      alert(res?.message || "Fixture generado correctamente.");

      await cargarEncuentros();
    } catch (error) {
      console.error(error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ELIMINAR ENCUENTRO
  // ==========================================================

  const eliminarEncuentro = async (id_encuentro) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar este encuentro?")
    ) {
      return;
    }

    try {
      await deleteEncuentro(id_encuentro);
      await cargarEncuentros();
    } catch (error) {
      console.error("No se pudo eliminar el encuentro:", error);
    }
  };

  // ==========================================================
  // ASIGNAR VEEDOR
  // ==========================================================

  const handleAsignarVeedor = async (id_encuentro, id_veedor) => {
    try {
      // Si selecciona "Sin veedor"
      if (!id_veedor) {
        await asignarVeedor(id_encuentro, null);
      } else {
        await asignarVeedor(id_encuentro, Number(id_veedor));
      }

      // Actualizar únicamente el encuentro modificado
      setEncuentros((prev) =>
        prev.map((encuentro) =>
          encuentro.id_encuentro === id_encuentro
            ? {
                ...encuentro,
                id_veedor: id_veedor ? Number(id_veedor) : null,
              }
            : encuentro,
        ),
      );

      alert(
        id_veedor
          ? "Veedor asignado correctamente."
          : "Veedor retirado correctamente.",
      );
    } catch (error) {
      console.error("Error al asignar veedor:", error);

      alert(error.message || "No se pudo asignar el veedor.");
    }
  };

  // ==========================================================
  // FORMATEAR FECHA
  // ==========================================================

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return "Por definir";

    return fechaRaw.split("T")[0].split("-").reverse().join("-");
  };

  // ==========================================================
  // ESTILO ESTADO
  // ==========================================================

  const obtenerEstiloEstado = (estado = "") => {
    switch (estado.toLowerCase()) {
      case "jugando":
        return styles.jugando;

      case "finalizado":
        return styles.finalizado;

      case "aplazado":
        return styles.aplazado;

      default:
        return styles.pendiente;
    }
  };

  // ==========================================================
  // AGRUPAR POR JORNADA
  // ==========================================================

  const encuentrosPorJornada = encuentros.reduce((acc, encuentro) => {
    const jornada = encuentro.jornada || "Por Definir";

    if (!acc[jornada]) {
      acc[jornada] = [];
    }

    acc[jornada].push(encuentro);

    return acc;
  }, {});

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className={styles.container}>
      {/* BARRA DE ACCIONES */}

      <div className={styles.headerTabla}>
        <button
          className={`${styles.btnAccion} ${styles.btnCrearAuto}`}
          onClick={handleGenerarFixture}
          disabled={loading}
        >
          {loading ? "Generando Fixture..." : "Generación Automática"}
        </button>

        <button
          className={`${styles.btnAccion} ${styles.btnCrearManual}`}
          onClick={() => navigate(`/encuentros/Crear/${id}`)}
        >
          + Crear Encuentro Manual
        </button>
      </div>

      {/* ENCUENTROS */}

      {encuentros.length === 0 ? (
        <div className={styles.sinDatos}>
          <p>
            No existen partidos registrados para este torneo en este momento.
          </p>
        </div>
      ) : (
        Object.entries(encuentrosPorJornada)
          .sort(([a], [b]) => a - b)
          .map(([jornada, partidos]) => (
            <div className={styles.contenedorJornada} key={jornada}>
              <h2 className={styles.tituloJornada}>Jornada {jornada}</h2>

              <div className={styles.listaPartidos}>
                {partidos.map((encuentro) => (
                  <div
                    key={encuentro.id_encuentro}
                    className={styles.encuentroCard}
                    onClick={() =>
                      navigate(`/cronologias/${encuentro.id_encuentro}`)
                    }
                  >
                    {/* FECHA */}

                    <div className={styles.fecha}>
                      📅 {formatearFecha(encuentro.fecha)}
                    </div>

                    {/* PARTIDO */}

                    <div className={styles.infoPartido}>
                      <div className={styles.marcador}>
                        <span className={styles.equipo}>
                          {encuentro.equipo_local}
                        </span>

                        <span className={styles.vs}>vs</span>

                        <span className={styles.equipo}>
                          {encuentro.equipo_visitante}
                        </span>
                      </div>

                      <span className={styles.lugar}>
                        📍 {encuentro.lugar || "Sin cancha"}
                      </span>
                    </div>

                    {/* HORA */}

                    <div className={styles.hora}>
                      ⏰ {encuentro.hora ? encuentro.hora.slice(0, 5) : "--:--"}
                    </div>

                    {/* ESTADO */}

                    <div>
                      <span
                        className={`${styles.estadoBadge} ${obtenerEstiloEstado(
                          encuentro.estado,
                        )}`}
                      >
                        {encuentro.estado || "Pendiente"}
                      </span>
                    </div>

                    {/* VEEDOR */}

                    <div
                      className={styles.asignacionVeedor}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label>Veedor:</label>

                      <select
                        value={encuentro.id_veedor || ""}
                        onChange={(e) =>
                          handleAsignarVeedor(
                            encuentro.id_encuentro,
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Sin veedor</option>

                        {veedores.map((veedor) => (
                          <option
                            key={veedor.id_usuario}
                            value={veedor.id_usuario}
                          >
                            {veedor.nombre_usuario} {veedor.apellido_usuario}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CONTROLES */}

                    <div className={styles.acciones}>
                      <button
                        className={`${styles.btnMini} ${styles.btnEditar}`}
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `/encuentros/editar/${encuentro.id_encuentro}`,
                          );
                        }}
                      >
                        Editar
                      </button>

                      <button
                        className={`${styles.btnMini} ${styles.btnEliminar}`}
                        onClick={(e) => {
                          e.stopPropagation();

                          eliminarEncuentro(encuentro.id_encuentro);
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
