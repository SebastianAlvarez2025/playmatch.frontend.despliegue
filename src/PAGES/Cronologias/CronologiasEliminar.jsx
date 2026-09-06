import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCronologia, getCronologiaById } from "../../services/cronologiasService";

export default function CronologiasEliminar() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [evento, setEvento] = useState(null);

  // Cargar los detalles del evento para mostrar qué se va a eliminar
  useEffect(() => {
    const obtenerDetalles = async () => {
      try {
        const data = await getCronologiaById(id);
        setEvento(data);
      } catch (error) {
        console.error("Error al obtener los detalles del evento:", error);
      }
    };
    obtenerDetalles();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteCronologia(id);
      navigate("/cronologias");
    } catch (error) {
      console.error("Error al eliminar la cronología:", error);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="tabla-container">
        <div className="header-tabla">
          <h2 className="titulo">Eliminar Registro de Cronología</h2>
        </div>

        <div className="formulario-admin" style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "20px", color: "#495057" }}>
            ¿Estás seguro de que deseas eliminar este evento de manera permanente? Esta acción no se puede deshacer.
          </p>

          {evento && (
            <div style={{
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              maxWidth: "500px",
              margin: "0 auto 30px auto",
              border: "1px solid #dee2e6",
              textAlign: "left"
            }}>
              <p style={{ margin: "6px 0" }}><strong>ID Registro:</strong> {id}</p>
              <p style={{ margin: "6px 0" }}><strong>Encuentro ID:</strong> {evento.id_encuentro}</p>
              <p style={{ margin: "6px 0" }}><strong>Jugador ID:</strong> {evento.id_jugador}</p>
              <p style={{ margin: "6px 0" }}><strong>Suceso:</strong> {evento.evento}</p>
              <p style={{ margin: "6px 0" }}><strong>Minuto:</strong> {evento.minuto}'</p>
            </div>
          )}

          <div className="acciones-formulario" style={{ justifyContent: "center", gap: "16px" }}>
            <button className="btn eliminar" onClick={handleDelete}>
              Sí, eliminar definitivamente
            </button>
            <button className="btn" style={{ backgroundColor: "#6c757d", color: "white" }} onClick={() => navigate("/cronologias")}>
              Cancelar y volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}