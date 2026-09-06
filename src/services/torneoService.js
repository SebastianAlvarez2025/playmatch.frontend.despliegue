import api from "./api";

// GET: Todos los torneos
export const getTorneos = async () => {
  try {
    const res = await api.get("/torneos");
    return res.data;
  } catch (error) {
    console.error("Error al obtener los torneos:", error);
    throw error;
  }
};

// GET: Torneos del usuario autenticado
export const getMisTorneos = async () => {
  try {
    const res = await api.get("/torneos/usuario/mios");
    return res.data;
  } catch (error) {
    console.error("Error al obtener mis torneos:", error);
    throw error;
  }
};

// GET: Torneo por ID
export const getTorneoById = async (id) => {
  try {
    const res = await api.get(`/torneos/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener el torneo ${id}:`, error);
    throw error;
  }
};

// GET: Encuentros asociados a un torneo
export const getEncuentrosByTorneo = async (id_torneo) => {
  try {
    const res = await api.get(`/encuentros/torneo/${id_torneo}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener encuentros del torneo ${id_torneo}:`, error);
    throw error;
  }
};

// DELETE: Eliminar un torneo por ID (Corregido el typo "eliminar")
export const eliminarTorneoService = async (id_torneo) => {
  try {
    const res = await api.delete(`/torneos/${id_torneo}`);
    return res.data;
  } catch (error) {
    console.error(`Error al eliminar el torneo ${id_torneo}:`, error);
    throw error;
  }
};

// ==========================================
// ALIAS DE EXPORTACIÓN (Para compatibilidad)
// ==========================================
export const obtenerTorneosService = getTorneos;
export const obtenerMisTorneosService = getMisTorneos;
export const obtenerTorneoPorIdService = getTorneoById;
export const elimarTorneoService = eliminarTorneoService; // Mantén este si algún otro archivo usaba el typo