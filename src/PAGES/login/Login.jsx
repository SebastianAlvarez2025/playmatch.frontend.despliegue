// ===================================================================
// Login.jsx
// Formulario de inicio de sesión. Al validar las credenciales con
// el backend, guarda el token y el usuario en el contexto de
// autenticación, y redirige según el rol:
// - Administrador -> /usuarios
// - Organizador   -> /torneos
// - Entrenador (DT) -> /home (su dashboard con Mi Equipo, encuentros, etc.)
// - Jugador       -> /home (dashboard general, con acceso a Mi Ficha)
// - Cualquier otro rol -> /home
// ===================================================================

import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginRequest } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../constants/roles";
import "../../styles/estilosPages/autenticacion/login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAuth({
      ...auth,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await loginRequest(auth);

      const { token, user } = res;

      // Normalización segura del rol (algunos endpoints mandan
      // "rol", otros "id_rol")
      const userData = {
        ...user,
        rol: user.rol ?? user.id_rol,
      };

      login(token, userData);

      // Redirección según rol
      if (userData.rol === ROLES.ADMINISTRADOR) {
        navigate("/home");
        return;
      }

      if (userData.rol === ROLES.ORGANIZADOR) {
        navigate("/home");
        return;
      }

      // Entrenador (Director Técnico) va a su dashboard de Inicio
      if (userData.rol === ROLES.ENTRENADOR) {
        navigate("/home");
        return;
      }

      // Jugador y cualquier otro rol van a /home
      navigate("/home");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card-box">
        <h3>Iniciar sesión</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="form-control"
              value={auth.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="****"
              className="form-control"
              value={auth.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="login-links">
          <p onClick={() => navigate("/registro")} className="link-text">
            ¿No tienes cuenta? Registrarse
          </p>

          <p
            onClick={() => navigate("/recuperar-password")}
            className="link-text disabled"
          >
            ¿Olvidaste tu contraseña?
          </p>
        </div>

        {error && <p className="error"><br/>{error}</p>}
      </div>
    </div>
  );
}