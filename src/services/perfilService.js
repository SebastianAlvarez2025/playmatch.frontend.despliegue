const API = import.meta.env.VITE_API_URL;

export const getPerfil = async (id) => {
    const response = await fetch(`${API}/usuarios/perfil/${id}`);

    if (!response.ok) {
        throw new Error("Error al obtener el perfil del usuario");
    }

    return await response.json();
}

export const actualizarPerfil = async (datos) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/usuarios/perfil`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el perfil del usuario");
    }

    return data;
}