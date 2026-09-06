const API = import.meta.env.VITE_API_URL + "/encuentros";

// ==========================================================
// OBTENER TODOS
// ==========================================================

export const getEncuentros = async () => {
  const res = await fetch(API);

  if (!res.ok) {
    throw new Error("Error al obtener los encuentros");
  }

  return await res.json();
};

// ==========================================================
// OBTENER POR ID
// ==========================================================

export const getEncuentroById = async (id) => {
  const res = await fetch(`${API}/${id}`);

  if (!res.ok) {
    throw new Error("Error al obtener el encuentro");
  }

  return await res.json();
};

// ==========================================================
// OBTENER DETALLE DEL ENCUENTRO
// ==========================================================

export const getEncuentroDetalle = async (id) => {
  const res = await fetch(`${API}/detalle/${id}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje ||
        errorData?.message ||
        "Error al obtener el detalle del encuentro",
    );
  }

  const data = await res.json();

  // El backend devuelve directamente el objeto
  // pero dejamos compatibilidad por si viene dentro de data.
  return data?.data || data;
};

// ==========================================================
// OBTENER ENCUENTROS POR TORNEO
// ==========================================================

export const getEncuentrosByTorneo = async (id_torneo) => {
  const res = await fetch(`${API}/torneo/${id_torneo}`);

  if (!res.ok) {
    throw new Error("Error al obtener los encuentros del torneo");
  }

  return await res.json();
};

// ==========================================================
// CREAR
// ==========================================================

export const createEncuentro = async (encuentro) => {
  const res = await fetch(API, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(encuentro),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje || errorData?.message || "Error al crear el encuentro",
    );
  }

  return await res.json();
};

// ==========================================================
// ACTUALIZAR
// ==========================================================

export const updateEncuentro = async (id, encuentro) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(encuentro),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje ||
        errorData?.message ||
        "Error al actualizar el encuentro",
    );
  }

  return await res.json();
};

// ==========================================================
// ACTUALIZAR ESTADO DEL ENCUENTRO
// ==========================================================

export const actualizarEstadoEncuentro = async (id, estado) => {
  const res = await fetch(`${API}/${id}/estado`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      estado,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje ||
        errorData?.message ||
        "Error al actualizar el estado del encuentro",
    );
  }

  return await res.json();
};

// ==========================================================
// ELIMINAR
// ==========================================================

export const deleteEncuentro = async (id) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje ||
        errorData?.message ||
        "Error al eliminar el encuentro",
    );
  }

  return await res.json();
};

// ==========================================================
// GENERAR FIXTURE AUTOMÁTICO
// ==========================================================

export const generarFixtureAutomatico = async (datos) => {
  const res = await fetch(`${API}/generar-fixture`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje || errorData?.message || "Error al generar el fixture",
    );
  }

  return await res.json();
};

// ASIGNAR VEEDOR A UN ENCUENTRO
export const asignarVeedor = async (id_encuentro, id_veedor) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/${id_encuentro}/asignar-veedor`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      id_veedor: Number(id_veedor),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje || errorData?.message || "Error al asignar el veedor",
    );
  }

  return await res.json();
};

// OBTENER ENCUENTROS DEL VEEDOR LOGUEADO
export const getEncuentrosByVeedor = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/mis-encuentros`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    throw new Error(
      errorData?.mensaje ||
        errorData?.message ||
        "Error al obtener los encuentros asignados",
    );
  }

  return await res.json();
};
