const API = import.meta.env.VITE_API_URL + "/posiciones";

// OBTENER TABLA DE POSICIONES POR TORNEO
export const getTablaPosiciones = async (id_torneo) => {
  const res = await fetch(`${API}/torneo/${id_torneo}`);

  return await res.json();
};
