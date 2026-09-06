import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/layouts/layoutPrivate.css";

export default function PrivateLayout() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }} className="private-wrapper">
      <Navbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }} className="private-body">
        {isAuthenticated && <Sidebar />}
        <main
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto", // 🛠️ ESTO PERMITE EL SCROLL CUANDO EL REGISTRO SEA GRANDE
            height: "100%",    /* Se ajusta al flex contenedor */
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
