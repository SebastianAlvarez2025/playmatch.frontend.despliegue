import api from "./api";

// ==========================================================
// OBTENER TODOS
// ==========================================================
export const getResultados = async () => {
  try {
    const response = await api.get("/resultados");

    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener resultados:",
      error.response?.data || error.message,
    );

    throw new Error("Error al obtener resultados");
  }
};

// ==========================================================
// OBTENER POR ID
// ==========================================================
export const getResultadoById = async (id) => {
  try {
    const response = await api.get(`/resultados/${id}`);

    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener resultado:",
      error.response?.data || error.message,
    );

    throw new Error("Error al obtener resultado");
  }
};

// ==========================================================
// CREAR
// ==========================================================
export const createResultado = async (resultado) => {
  try {
    const response = await api.post("/resultados", resultado);

    return response.data;
  } catch (error) {
    console.error(
      "Error al crear resultado:",
      error.response?.data || error.message,
    );

    throw new Error("Error al crear resultado");
  }
};

// ==========================================================
// ACTUALIZAR POR ID DEL RESULTADO
// ==========================================================
export const updateResultado = async (id, resultado) => {
  try {
    const response = await api.put(`/resultados/${id}`, resultado);

    return response.data;
  } catch (error) {
    console.error(
      "Error al actualizar resultado:",
      error.response?.data || error.message,
    );

    throw new Error("Error al actualizar resultado");
  }
};

// ==========================================================
// ACTUALIZAR POR ENCUENTRO
// ==========================================================
export const updateResultadoByEncuentro = async (idEncuentro, resultado) => {
  try {
    const response = await api.put(
      `/resultados/encuentro/${idEncuentro}`,
      resultado,
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error al actualizar resultado del encuentro:",
      error.response?.data || error.message,
    );

    throw new Error("Error al actualizar el resultado del encuentro");
  }
};

// ==========================================================
// ELIMINAR
// ==========================================================
export const deleteResultado = async (id) => {
  try {
    const response = await api.delete(`/resultados/${id}`);

    return response.data;
  } catch (error) {
    console.error(
      "Error al eliminar resultado:",
      error.response?.data || error.message,
    );

    throw new Error("Error al eliminar resultado");
  }
};

// ==========================================================
// OBTENER RESULTADO POR ENCUENTRO
// ==========================================================
export const getResultadoByEncuentro = async (idEncuentro) => {
  try {
    const response = await api.get(`/resultados/encuentro/${idEncuentro}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

// ==========================================================
// SUMAR GOL
// ==========================================================
export const sumarGolResultado = async ({ idEncuentro, equipo }) => {
  try {
    const response = await api.put("/resultados/sumar-gol", {
      idEncuentro,
      equipo,
    });

    return response.data;
  } catch (error) {
    console.error("Error al sumar gol:", error.response?.data || error.message);

    throw new Error("Error al sumar gol");
  }
};
