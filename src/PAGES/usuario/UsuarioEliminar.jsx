import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; 
import styles from "./UsuarioEliminar.module.css"; 

const API = import.meta.env.VITE_API_URL + "/usuarios";

export default function UsuarioEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [usuario, setUsuario] = useState({
    id_rol: "",
    nombre_usuario: "",
    apellido_usuario: "",
    telefono: "",
    email: "",
  });

  const getUsuario = async () => {
    try {
      const res = await fetch(`${API}/${id}`);
      const data = await res.json();

      // Mapeo seguro basándonos en tu estructura de API estándar
      const userData = data?.data || data;
      const item = Array.isArray(userData) ? userData[0] : userData;

      setUsuario({
        id_rol: item?.id_rol || "",
        nombre_usuario: item?.nombre_usuario || "",
        apellido_usuario: item?.apellido_usuario || "",
        telefono: item?.telefono || "",
        email: item?.email || "",
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (id) getUsuario();
  }, [id]);

  const desactivarUsuario = async () => {
    try {
      const res = await fetch(`${API}/desactivar/${id}`, {
        method: "PUT",
        headers: {
          // 🛠️ Corrección crítica: Mandar el token para que Laravel no rechace la petición
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok){
        alert(data.message);
        return;
      }
      
      alert("El usuario se desactivo correctamente.");
      navigate("/usuarios");

    } catch (err) {
      console.error(err.message);
      alert("No se pudo desactivar el usuario");
    }
  };

  return (
    <div className="equipo-eliminar-page">
      <h1>Desactivar usuario</h1>

      <p>
        ¿Está seguro de que desea desactivar al usuario <strong> {usuario.nombre_usuario} {usuario.apellido_usuario} </strong> con correo
        electrónico <strong>{usuario.email}</strong>?
      </p>

      {/* Advertencia  */}
      <p className="advertencia">
        ⚠️ Esta acción no elimina el usuario para siempre,
        solo lo marca como inactivo.
      </p>


      <div className="acciones">
        <button onClick={desactivarUsuario} >
          Desactivar
        </button> 

        <button onClick={() => navigate("/usuarios")} >
          Cancelar
        </button>
      </div>
    </div>
  );
}