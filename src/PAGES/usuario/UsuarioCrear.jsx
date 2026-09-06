import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Asegura tener la sesión si la API lo pide
import styles from "./UsuarioCrear.module.css"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  validarCorreo,
  validarTelefono as validarFormatoTelefono,
  validarPassword,
} from "../../utils/validaciones";


const API = import.meta.env.VITE_API_URL;

export default function UsuarioCrear() {
  const navigate = useNavigate();
  const [identificacionError, setIdentificacionError] = useState("");
  const { token } = useContext(AuthContext);
  const [telefonoError, setTelefonoError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fechaError, setFechaError] = useState("");
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_usuario: "",
    id_documento: "",
    id_rol: 1,
    nombre_usuario: "",
    apellido_usuario: "",
    telefono: "",
    email: "",
    password: "",
    fecha_nacimiento: "",
  });

  const administrador = "Administrador";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nombre_usuario" || name === "apellido_usuario") {
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
      
      setForm((prev) => ({
        ...prev,
        [name]: soloLetras,
      }));
      return; 
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "id_rol" || name === "id_documento" ? Number(value) : value,
    }));
  };

  const validarEmailAPI = async () => {
    if (!form.email) return;

    try {
      const response = await fetch(`${API}/usuarios/email/${form.email}`);
      const data = await response.json();

      if (data.existe) {
        setEmailError("Este correo electrónico ya está registrado");
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validarEdad = () => {
    if (!form.fecha_nacimiento) return true;

    const fechaNacimiento = new Date(form.fecha_nacimiento);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    if (edad < 12) {
      setFechaError("Debes ser mayor de 12 años para registrarte.");
      return false;
    } else {
      setFechaError("");
      return true;
    }
  };


  const validarTelefonoAPI = async () => {
    if (!form.telefono) return;

    try {
      const response = await fetch(`${API}/auth/telefono/${form.telefono}`);

      const data = await response.json();

      if (data.existe) {
        setTelefonoError("Este teléfono ya existe");
      } else {
        setTelefonoError("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validarIdentificacionAPI = async () => {
    if (!form.id_usuario) return;

    try {
      const response = await fetch(`${API}/usuarios/identificacion/${form.id_usuario}`);

      const data = await response.json();

      if (data.existe) {
        setIdentificacionError("Este número de documento ya está registrado");
      } else {
        setIdentificacionError("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const requisitos = validarPassword(form.password);
  
  const validacionContraseña =
    requisitos.longitud &&
    requisitos.especial &&
    requisitos.minuscula &&
    requisitos.mayuscula &&
    requisitos.numero;
    

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.id_usuario ||
      !form.id_documento ||
      !form.id_rol ||
      !form.nombre_usuario ||
      !form.apellido_usuario ||
      !form.telefono ||
      !form.email ||
      !form.password
    ) {
      alert("Completa todos los campos");
      return;
    }

    if (emailError || telefonoError) {
      return;
    }

    if (!validarEdad()) {
      return;
    }

    if (!validacionContraseña) {
      setPasswordError(
        "La contraseña no cumple con los requisitos de seguridad",
      );
      return;
    }

    if (!validarCorreo(form.email)) {
      setEmailError("Correo electrónico inválido.");
      return;
    }

    if (!validarFormatoTelefono(form.telefono)) {
      setTelefonoError("El teléfono debe iniciar por 3 y tener 10 dígitos.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${API}/usuarios/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error creando administrador");
      alert("Administrador creado.")

      navigate("/usuarios");


    } catch (err) {
      console.error(err.message);
      alert(err.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.titulo}>Crear usuario</h2>

        <form className={styles.form} onSubmit={handleSubmit}>

          <div>
            <label htmlFor="id_usuario">Número de documento </label>
            <input
              className={styles.input}
              type="number"
              name="id_usuario"
              placeholder="Número de documento"
              value={form.id_usuario}
              onChange={handleChange}
              onBlur={validarIdentificacionAPI} 
              required
            />

            {identificacionError && <p className={styles.errorText}>{identificacionError}</p>}
          </div>

          <div>
            <label htmlFor="id_documento">Documento</label>
            <select
              className={styles.select}
              id="id_documento"
              name="id_documento"
              value={form.id_documento}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona un documento</option>
              <option value={1}>Cedula</option>
              <option value={2}>Tarjeta de identidad</option>
            </select>
          </div>


          <div>
            <label htmlFor="id_rol">Rol </label>
            <input
              className={styles.input}
              name="id_rol"
              placeholder="ID rol"
              value={administrador}
              disabled
            />
          </div>


          <div>
            <label htmlFor="nombre_usuario">Nombre </label>
            <input
              className={styles.input}
              type="text"
              name="nombre_usuario"
              placeholder="Nombre"
              value={form.nombre_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="apellido_usuario">Apellido </label>
            <input
              className={styles.input}
              name="apellido_usuario"
              type="text"
              placeholder="Apellido"
              value={form.apellido_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="fecha_nacimiento">Fecha de nacimiento </label>
            <input
              className={styles.input}
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              onBlur={validarEdad} 
              required
            />

            {fechaError && <p className={styles.errorText}>{fechaError}</p>}

          </div>

          <div>
            <label htmlFor="telefono">Teléfono </label>
            <input
              className={styles.input}
              type="number"
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              onBlur={validarTelefonoAPI}
              required
            />

            {telefonoError && <p className={styles.errorText}>{telefonoError}</p>}
          </div>

          <div>
            <label htmlFor="email">Correo electrónico </label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              onBlur={validarEmailAPI}
              required
            />

            {emailError && <p className={styles.errorText}>{emailError}</p>}
          </div>

          
            <div className="password-wrapper">
              <label htmlFor="password">Contraseña</label>

              <div className="password-input">
                <input
                  id="password"
                  className={styles.input}
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setMostrarRequisitos(true)}
                  onBlur={() => setMostrarRequisitos(false)}
                  required
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                >
                  {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

                {passwordError && <p className={styles.errorText}>{passwordError}</p>}

              </div>

              {mostrarRequisitos && (
                <div className="password-card">
                  <h4>La contraseña debe contener:</h4>

                  <p className={requisitos.longitud ? "ok" : "bad"}>
                    {requisitos.longitud ? "✔" : "✖"} Entre 8 y 16 caracteres
                  </p>

                  <p className={requisitos.mayuscula ? "ok" : "bad"}>
                    {requisitos.mayuscula ? "✔" : "✖"} Una letra mayúscula
                  </p>

                  <p className={requisitos.minuscula ? "ok" : "bad"}>
                    {requisitos.minuscula ? "✔" : "✖"} Una letra minúscula
                  </p>

                  <p className={requisitos.numero ? "ok" : "bad"}>
                    {requisitos.numero ? "✔" : "✖"} Un número
                  </p>

                  <p className={requisitos.especial ? "ok" : "bad"}>
                    {requisitos.especial ? "✔" : "✖"} Un carácter especial
                  </p>
                </div>
              )}
            </div>

          <div className={styles.actions}>
            <button 
              className={`${styles.btn} ${styles.btnSubmit}`} 
              type="submit"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear"}
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