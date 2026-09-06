import api from "./api";

// ==========================================================
// OBTENER TODAS LAS CRONOLOGÍAS
// ==========================================================
export const getCronologias = async () => {
  try {
    const response = await api.get("/cronologias");
    return response.data;
  } catch (error) {
    console.error("Error al obtener cronologías:", error);
    throw new Error("Error al obtener cronologías");
  }
};

// ==========================================================
// OBTENER CRONOLOGÍA POR ID
// ==========================================================
export const getCronologiaById = async (id) => {
  try {
    const response = await api.get(`/cronologias/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener cronología:", error);
    throw new Error("Error al obtener cronología");
  }
};

// ==========================================================
// CREAR CRONOLOGÍA
// ==========================================================
export const createCronologia = async (cronologia) => {
  try {
    const response = await api.post("/cronologias", cronologia);
    return response.data;
  } catch (error) {
    console.error("Error al crear cronología:", error);
    throw new Error("Error al crear cronología");
  }
};

// ==========================================================
// ACTUALIZAR CRONOLOGÍA
// ==========================================================
export const updateCronologia = async (id, cronologia) => {
  try {
    const response = await api.put(`/cronologias/${id}`, cronologia);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar cronología:", error);
    throw new Error("Error al actualizar cronología");
  }
};

// ==========================================================
// ELIMINAR CRONOLOGÍA
// ==========================================================
export const deleteCronologia = async (id) => {
  try {
    const response = await api.delete(`/cronologias/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar cronología:", error);
    throw new Error("Error al eliminar cronología");
  }
};

// ==========================================================
// OBTENER JUGADORES DEL ENCUENTRO
// ==========================================================
export const getJugadoresByEncuentro = async (id_encuentro) => {
  try {
    const response = await api.get(
      `/cronologias/encuentro/${id_encuentro}/jugadores`,
    );

    return response.data;
  } catch (error) {
    console.error("Error al obtener jugadores del encuentro:", error);

    throw new Error("Error al obtener jugadores del encuentro");
  }
};

// ==========================================================
// DETALLE DEL ENCUENTRO
// ==========================================================
export const getEncuentroDetalle = async (id) => {
  try {
    const response = await api.get(`/encuentros/detalle/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error al obtener detalle del encuentro:", error);

    throw new Error("Error al obtener detalle del encuentro");
  }
};
