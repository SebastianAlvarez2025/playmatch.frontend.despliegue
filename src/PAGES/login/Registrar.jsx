import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/estilosPages/autenticacion/registrarse.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  validarCorreo,
  validarTelefono as validarFormatoTelefono,
  validarPassword,
} from "../../utils/validaciones";

const Registrar = () => {
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [usuario, setUsuario] = useState({
    id_usuario: "",
    id_documento: "",
    nombre_usuario: "",
    apellido_usuario: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    password: "",
    confirmarPassword: "",
    id_rol: "",
  });

  const [identificacionError, setIdentificacionError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [fechaError, setFechaError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nombre_usuario" || name === "apellido_usuario") {
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
      
      setUsuario((prev) => ({
        ...prev,
        [name]: soloLetras,
      }));
      return; 
    }

    setUsuario((prev) => ({
      ...prev,
      [name]: name === "id_rol" || name === "id_documento" ? Number(value) : value,
    }));
  };

  const validarEmailAPI = async () => {
    if (!usuario.email) return;

    try {
      const response = await fetch(`${API}/usuarios/email/${usuario.email}`);

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
    if (!usuario.fecha_nacimiento) return true;

    const fechaNacimiento = new Date(usuario.fecha_nacimiento);
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
    if (!usuario.telefono) return;

    try {
      const response = await fetch(`${API}/auth/telefono/${usuario.telefono}`);

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
    if (!usuario.id_usuario) return;

    try {
      const response = await fetch(`${API}/usuarios/identificacion/${usuario.id_usuario}`);

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
  
  const requisitos = validarPassword(usuario.password);

  const validacionContraseña =
    requisitos.longitud &&
    requisitos.especial &&
    requisitos.minuscula &&
    requisitos.mayuscula &&
    requisitos.numero;

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(usuario);

    if (
      !usuario.id_usuario ||
      !usuario.id_documento ||
      !usuario.id_rol ||
      !usuario.nombre_usuario ||
      !usuario.apellido_usuario ||
      !usuario.telefono ||
      !usuario.email ||
      !usuario.password ||
      !usuario.confirmarPassword
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

    if (usuario.password !== usuario.confirmarPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (!validarCorreo(usuario.email)) {
      setEmailError("Correo electrónico inválido.");
      return;
    }

    if (!validarFormatoTelefono(usuario.telefono)) {
      setTelefonoError("El teléfono debe iniciar por 3 y tener 10 dígitos.");
      return;
    }

    try {
      const response = await fetch(`${API}/auth/enviar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const data = await response.json();

      if (data.success) {
        setUsuario({
          id_usuario: "",
          id_documento: "",
          nombre_usuario: "",
          apellido_usuario: "",
          fecha_nacimiento: "",
          telefono: "",
          email: "",
          password: "",
          id_rol: "",
          confirmarPassword: "",
        });

        
        navigate("/codigo-registro", {
          state: {
            email: usuario.email,
          },
        });
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div className="registro-container">
      <div className="card-registrar">
        <h3>Registrar Usuario</h3>
        <h3>⚽ Crear cuenta</h3>
        <p className="subtitle">
          Únete a PlayMatch y comienza a gestionar torneos, administrar equipos
          o participar como entrenador desde una sola plataforma.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Rol</label>

              <select
                className="opciones_rol"
                id="id_rol"
                name="id_rol"
                value={usuario.id_rol}
                onChange={handleChange}
              >
                <option value="">Seleccione un rol</option>
                {/* Aclaración importante: El value que se le está
                      asignando directamente para que se carge en el handleChange
                      es la id del rol tal cual como está asignada en la base de datos, es decir,
                      el "value={2}> Organizador <" es porque en la base de datos 
                      en la tabla "roles" el id 2 le pertenece al administrador. */}
                <option value={2}>Organizador</option>
                <option value={3}>Jugador</option>
                <option value={5}>Entrenador</option>
                <option value={8}>Veedor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo documento</label>

              <select
                className="opciones_documento"
                id="id_documento"
                name="id_documento"
                value={usuario.id_documento}
                onChange={handleChange}
              >
                <option value="">Seleccione un tipo</option>
                <option value={1}>Cédula</option>
                <option value={2}>Tarjeta de identidad</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Número de documento</label>

              <input
                id="documento"
                className="form-control"
                type="number"
                name="id_usuario"
                value={usuario.id_usuario}
                onChange={handleChange}
                onBlur={validarIdentificacionAPI} 
              />

              {identificacionError && <p className="mensaje-error">{identificacionError}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Fecha nacimiento</label>

              <input
                id="fecha_nacimiento"
                className="form-control"
                type="date"
                name="fecha_nacimiento"
                value={usuario.fecha_nacimiento}
                onBlur={validarEdad} 
                onChange={handleChange}
              />

              {fechaError && <p className="mensaje-error">{fechaError}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Nombre</label>

              <input
                id="nombre"
                className="form-control"
                type="text"
                name="nombre_usuario"
                value={usuario.nombre_usuario}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellido</label>

              <input
                id="apellido"
                className="form-control"
                type="text"
                name="apellido_usuario"
                value={usuario.apellido_usuario}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group-full">
            <label className="form-label">Teléfono</label>

            <input
              id="telefono"
              className="form-control"
              type="number"
              name="telefono"
              value={usuario.telefono}
              onChange={handleChange}
              onBlur={validarTelefonoAPI}
            />

            {telefonoError && <p className="mensaje-error">{telefonoError}</p>}
          </div>

          <div className="form-group-full">
            <label className="form-label">Correo electrónico</label>

            <input
              id="correo"
              className="form-control"
              type="email"
              name="email"
              value={usuario.email}
              onChange={handleChange}
              onBlur={validarEmailAPI}
            />

            {emailError && <p className="mensaje-error">{emailError}</p>}
          </div>

          <div className="form-group-full">
            <div className="password-wrapper">
              <label className="form-label">Contraseña</label>

              <div className="password-input">
                <input
                  id="password"
                  className="form-control password-control"
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={usuario.password}
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
          </div>

          <div className="form-group-full">
            <label className="form-label">Confirmar contraseña</label>
            <div className="password-input">
              <input
                id="confirmar-password"
                className="form-control password-control"
                type={mostrarConfirmarPassword ? "text" : "password"}
                name="confirmarPassword"
                placeholder="Contraseña"
                value={usuario.confirmarPassword}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setMostrarConfirmarPassword(!mostrarConfirmarPassword)
                }
              >
                {mostrarConfirmarPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {passwordError && <p className="password-error">{passwordError}</p>}
          </div>

          <button className="btn-main">Crear cuenta</button>
        </form>

        <p onClick={() => navigate("/login")} className="link-text">
          ¿Ya tienes una cuenta?, Inicia sesión
        </p>
      </div>
    </div>
  );
};

export default Registrar;
