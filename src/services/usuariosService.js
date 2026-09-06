// ===================================================================
// usuariosService.js
// Funciones para consultar usuarios desde el backend, usadas
// principalmente para el módulo de Jugadores (el DT elige un
// usuario existente para registrarlo como jugador de su equipo).
// ===================================================================

import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Instancia de axios con el token agregado automáticamente

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 GET TODOS los usuarios del sistema
export const getUsuarios = async () => {
  const res = await api.get("/usuarios");
  return res.data;
};

// 🔹 GET usuarios "disponibles" para ser registrados como jugadores
//    (el backend ya filtra  en getUsuariosDisponiblesModel).
//   el backend envuelve la lista en { data: [...] }, así que
//    extraemos directamente el array de usuarios de ahí.
export const getUsuariosDisponibles = async () => {
  const res = await api.get("/usuarios/disponibles");
  return res.data.data;
};

// 🔹 GET usuario por ID
export const getUsuarioById = async (id) => {
  const res = await api.get(`/usuarios/${id}`);
  return res.data;
};

export const getVeedores = async () => {
  const res = await fetch(`${API}/usuarios/veedores`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje ||
        errorData?.message ||
        "Error al obtener los veedores",
    );
  }

  return await res.json();
};
