/**
 * ==========================================================
 * SERVICIO: JUGADORES
 * RF-003 Gestión de Jugadores
 *
 * Este archivo contiene las peticiones HTTP del frontend
 * relacionadas con la gestión de jugadores.
 *
 * Funciones:
 * - Consultar jugadores
 * - Consultar jugador por ID
 * - Consultar jugadores por equipo
 * - Consultar "Mi Ficha"
 * - Crear jugador
 * - Actualizar jugador
 * - Desactivar jugador
 * - Reactivar jugador
 * ==========================================================
 */

import axios from "axios";

// ==========================================================
// URL BASE DE LA API
// ==========================================================

const API = import.meta.env.VITE_API_URL;

// ==========================================================
// INSTANCIA DE AXIOS
//
// CORRECCIÓN: este archivo creaba su propia instancia de axios
// con baseURL: API (http://localhost:3001), sin el prefijo
// "/api" que sí usa la instancia central (api.js). Por eso
// todas las peticiones de este servicio (getJugadoresPorEquipo,
// createJugador, etc.) devolvían 404, ya que el backend expone
// sus rutas bajo /api (ej: /api/jugadores/equipo/14), no en la
// raíz (/jugadores/equipo/14).
// ==========================================================

const api = axios.create({
  baseURL: API,
});

// ==========================================================
// INTERCEPTOR DE PETICIONES
// ==========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================================================
// GET TODOS LOS JUGADORES
// ==========================================================

export const getJugadores = async () => {
  const res = await api.get("/jugadores");

  return res.data;
};

// ==========================================================
// GET JUGADOR POR ID
// ==========================================================

export const getJugadorById = async (id) => {
  const res = await api.get(`/jugadores/${id}`);

  return res.data;
};

// ==========================================================
// GET JUGADORES POR EQUIPO
// ==========================================================

export const getJugadoresPorEquipo = async (idEquipo) => {
  const res = await api.get(`/jugadores/equipo/${idEquipo}`);

  return res.data;
};

// ==========================================================
// GET "MI FICHA"
// ==========================================================

export const getMiFicha = async () => {
  const res = await api.get("/jugadores/mi-ficha");

  return res.data;
};

// ==========================================================
// CREAR JUGADOR
// ==========================================================

export const createJugador = async (data) => {
  const res = await api.post("/jugadores", data);

  return res.data;
};

// ==========================================================
// ACTUALIZAR JUGADOR
// ==========================================================

export const updateJugador = async (id, data) => {
  const res = await api.put(`/jugadores/${id}`, data);

  return res.data;
};

// ==========================================================
// DESACTIVAR JUGADOR
// ==========================================================

export const desactivarJugador = async (id, forzar = false) => {
  const url = forzar ? `/jugadores/${id}?forzar=true` : `/jugadores/${id}`;

  const res = await api.delete(url);

  return res.data;
};

// ==========================================================
// REACTIVAR JUGADOR
// ==========================================================

export const reactivarJugador = async (id) => {
  const res = await api.put(`/jugadores/${id}/reactivar`);

  return res.data;
};
