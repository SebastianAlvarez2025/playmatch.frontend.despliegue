import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // evita errores al recargar
  if (loading) return <p>Cargando...</p>;

  // No logueado
  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // VALIDAR ROL (mejorado)
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}
