import "../styles/estilosComponents/Pagination.css";

export default function Pagination({
  totalRegistros,
  registrosPorPagina,
  paginaActual,
  setPaginaActual,
}) {
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const obtenerPaginas = () => {
    const paginas = [];

    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    if (paginaActual <= 3) {
      paginas.push(1, 2, 3, "...", totalPaginas);
      return paginas;
    }

    if (paginaActual >= totalPaginas - 3) {
      paginas.push(1, "...", totalPaginas - 2, totalPaginas - 1, totalPaginas);
      return paginas;
    }

    paginas.push(
      1,
      "...",
      paginaActual - 1,
      paginaActual,
      paginaActual + 1,
      "...",
      totalPaginas,
    );

    return paginas;
  };

  if (totalPaginas <= 1) return null;

  const paginas = obtenerPaginas();

  return (
    <div className="pagination">
      <button
        onClick={() => setPaginaActual(paginaActual - 1)}
        disabled={paginaActual === 1}
      >
        ← Anterior
      </button>

      <div className="pagination-numbers">
        {obtenerPaginas().map((item, index) => {
          if (item === "...") {
            return (
              <span key={`dots-${index}`} className="pagination-dots">
                ...
              </span>
            );
          }

          return (
            <button
              key={`${item}-${index}`}
              className={item === paginaActual ? "active" : ""}
              onClick={() => setPaginaActual(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setPaginaActual(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
      >
        Siguiente →
      </button>
    </div>
  );
}
