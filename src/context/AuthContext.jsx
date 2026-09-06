import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    window.location.href = "/login";
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setToken(storedToken);

      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const finalUser = parsedUser || {
        id_usuario: decoded.id_usuario,
        email: decoded.email,
        rol: decoded.rol,
      };

      setUser(finalUser);

      localStorage.setItem("user", JSON.stringify(finalUser));
    } catch (error) {
      console.error(error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken, userData) => {
    const finalUser = {
      id_usuario: userData.id_usuario,
      email: userData.email,
      rol: userData.rol ?? userData.id_rol,
      nombre_usuario: userData.nombre_usuario,
      apellido_usuario: userData.apellido_usuario,
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(finalUser));

    setToken(newToken);
    setUser(finalUser);
  };

  const actualizarUsuario = (nuevosDatos) => {
    const actualizado = { ...user, ...nuevosDatos };
    localStorage.setItem("user", JSON.stringify(actualizado));
    setUser(actualizado);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        actualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
