import api from "./api.js";

// ==========================================================
// OBTENER TODAS LAS INSCRIPCIONES
// ==========================================================

export const getInscripciones = async () => {
  const res = await api.get("/inscripciones");

  return res.data;
};

// ==========================================================
// OBTENER INSCRIPCIÓN POR ID
// ==========================================================

export const getInscripcionById = async (id) => {
  const res = await api.get(`/inscripciones/${id}`);

  return res.data;
};

// ==========================================================
// OBTENER INSCRIPCIONES POR TORNEO
// ==========================================================

export const getInscripcionesPorTorneo = async (idTorneo) => {
  const res = await api.get(`/inscripciones/torneo/${idTorneo}`);

  return res.data;
};

// ==========================================================
// OBTENER INSCRIPCIONES POR EQUIPO
// ==========================================================

export const getInscripcionesPorEquipo = async (idEquipo) => {
  const res = await api.get(`/inscripciones/equipo/${idEquipo}`);

  return res.data;
};

// ==========================================================
// CREAR INSCRIPCIÓN
// ==========================================================

export const createInscripcion = async (data) => {
  const res = await api.post("/inscripciones", data);

  return res.data;
};

// ==========================================================
// ACTUALIZAR ESTADO
// ==========================================================

export const updateInscripcion = async (id, data) => {
  const res = await api.put(`/inscripciones/${id}/estado`, data);

  return res.data;
};

// ==========================================================
// ELIMINAR / DESACTIVAR INSCRIPCIÓN
// ==========================================================

export const deleteInscripcion = async (id) => {
  const res = await api.delete(`/inscripciones/${id}`);

  return res.data;
};
