import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // 👈 Contexto inyectado
import styles from "./UsuarioEditar.module.css"; // 👈 CSS encapsulado

const API = import.meta.env.VITE_API_URL + "/usuarios";

export default function UsuarioEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext); // 👈 Capturando token para Laravel
  const rolActual = Number(user?.rol);

  const [form, setForm] = useState({
    id: "",
    id_documento: "",
    nombre_documento: "",
    id_rol: "",
    nombre_usuario: "",
    apellido_usuario: "",
    telefono: "",
    email: "",
    password: "", // 🛠️ Inicializado correctamente para evitar advertencias de React
  });

  const getUsuario = async () => {
    try {
      const res = await fetch(`${API}/${id}`);
      if (!res.ok) throw new Error("Error cargando usuario");

      const data = await res.json();
      // Mapeo seguro si la data viene cruda o encapsulada por Laravel Resource
      const userData = data?.data || data;
      const user = Array.isArray(userData) ? userData[0] : userData;

      setForm({
        id: user?.id || "",
        id_documento: user?.id_documento || "",
        nombre_documento: user?.nombre_documento || "",
        id_rol: user?.id_rol || "",
        nombre_usuario: user?.nombre_usuario || "",
        apellido_usuario: user?.apellido_usuario || "",
        telefono: user?.telefono || "",
        email: user?.email || "",
        password: "", // La contraseña nunca se pinta por razones de seguridad
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (id) getUsuario();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Opcional: Si el campo password está vacío, puedes removerlo para no sobreescribirlo como vacío en la BD
      const datosAEnviar = { ...form };
      if (!datosAEnviar.password) {
        delete datosAEnviar.password;
      }

      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🛠️ Corrección crítica de seguridad
        },
        body: JSON.stringify(datosAEnviar),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error actualizando usuario");
      alert("Usuario actualizado.")
      
      navigate("/usuarios");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.titulo}>Editar usuario</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="id_usuario">Identificación</label>
            <input
              className={styles.input}
              name="id_usuario"
              placeholder="Identificación"
              value={form.id}
              readOnly
              required
            />
          </div>

          <div>
            <label htmlFor="id_documento">Tipo de identificación</label>
            <input
              className={styles.input}
              name="id_documento"
              placeholder="Tipo de documento"
              value={form.nombre_documento}
              readOnly
              required
            />
          </div>

          <div>
            <label htmlFor="id_rol">Rol</label>
            <select
              className={styles.select}
              name="id_rol"
              value={form.id_rol}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona un rol</option>
              {rolActual === 11 && (
                <option value={1}>Administrador</option>
              )}
              <option value={2}>Organizador</option>
              <option value={3}>Jugador</option>
              <option value={5}>Entrenador</option>
              <option value={8}>Veedor</option>
            </select>
          </div>

          <div>
            <label htmlFor="nombre_usuario">Nombre</label>
            <input
              className={styles.input}
              name="nombre_usuario"
              placeholder="Nombre"
              value={form.nombre_usuario}
              readOnly
              required
            />
          </div>

          <div>
            <label htmlFor="apellido_usuario">Apellido</label>
            <input
              className={styles.input}
              name="apellido_usuario"
              placeholder="Apellido"
              value={form.apellido_usuario}
              readOnly
              required
            />
          </div>


          <div>
            <label htmlFor="telefono">Telefono</label>
            <input
              className={styles.input}
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="email">Correo</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              readOnly
              required
            />
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnSubmit}`} type="submit">
              Actualizar
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancelar}`}
              onClick={() => navigate("/usuarios")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}