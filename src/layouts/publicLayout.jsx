import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function PublicLayout() {
  const location = useLocation();
  const { user } = useContext(AuthContext); 

  const rutasSinSidebar = ["/home", "/", "/login", "/registro"];
  const esRutaPublica = rutasSinSidebar.includes(location.pathname);

  // Si está en una ruta pública Y NO hay sesión iniciada, oculta el Sidebar
  const mostrarSidebar = esRutaPublica ? !!user : true;

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar /> 

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {mostrarSidebar && <Sidebar />}

        <main
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}