import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import styles from "./CategoriasAdmin.module.css"; 

const API = import.meta.env.VITE_API_URL + "/categorias";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const location = useLocation();
  const navigate = useNavigate();

  const getCategorias = async () => {
  try {
    // Cambia la ruta 'API' por el endpoint que llama a getCategoriasActivasModel
    const response = await fetch(`${API}/activas`); 
    const data = await response.json();
    setCategorias(Array.isArray(data) ? data : data?.data || []);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

useEffect(() => {
  getCategorias();
}, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPaginaActual(1);

    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  };

  const filtrados = categorias.filter((c) => {
    const query = search.toLowerCase();
    const esActivo = c.activo === 1 || c.activo === true;
    const estadoTexto = esActivo ? "activo" : "inactivo";

    return (
      (c.nombre_categoria || "").toLowerCase().includes(query) ||
      String(c.edad_minima ?? "").toLowerCase().includes(query) ||
      String(c.edad_maxima ?? "").toLowerCase().includes(query) ||
      estadoTexto.includes(query)
    );
  });

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const categoriasPaginadas = filtrados.slice(primerRegistro, ultimoRegistro);

  return (
    <div className={styles.torneosContainer}>
      <div className={styles.tablaContainer}>
        
        <div className={styles.torneosHeader}>
          <h2 className={styles.titulo}>Gestión de Categorías</h2>

          <div className={styles.accionesSuperiores}>
            <div className={styles.cajaBuscarInterna}>
              <span className={styles.iconoLupa}>🔍</span>
              <input
                id="buscar_categoria"
                type="text"
                placeholder="Buscar categoría..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <button
              className={`${styles.btn} ${styles.crear}`}
              onClick={() => navigate("/categorias/crear")}
            >
              Crear Categoría
            </button>
          </div>
        </div>

        <table className={styles.tablaTorneos}>
          <thead>
            <tr>
              <th>Nombre De Categoría</th>
              <th>Edad Mínima</th>
              <th>Edad Máxima</th>
              <th>Estado</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.length > 0 ? (
              categoriasPaginadas.map((c) => {
                const esActivo = c.activo === 1 || c.activo === true;

                return (
                  <tr key={c.id_categoria}>
                    <td>
                      <span className={styles.badgeCategoria}>
                        {c.nombre_categoria}
                      </span>
                    </td>
                    <td>{c.edad_minima} años</td>
                    <td>{c.edad_maxima} años</td>
                    <td>
                      <span
                        className={`${styles.badgeEstado} ${
                          esActivo ? styles.activo : styles.inactivo
                        }`}
                      >
                        {esActivo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className={`${styles.btn} ${styles.editar}`}
                        onClick={() => navigate(`/categorias/editar/${c.id_categoria}`)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {search
                    ? `No hay resultados para "${search}"`
                    : "No hay categorías disponibles"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          totalRegistros={filtrados.length}
          registrosPorPagina={registrosPorPagina}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
        />
      </div>
    </div>
  );
}