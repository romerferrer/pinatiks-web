/**
 * Lista de páginas a mostrar en la paginación:
 * todos los números si hay pocas páginas, o una ventana
 * alrededor de la página actual con puntos suspensivos.
 */
function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const list = []
  let previous = 0
  for (const page of pages) {
    if (page - previous > 1) list.push('…')
    list.push(page)
    previous = page
  }
  return list
}

export default function Pagination({ page, numPages, hasPrevious, hasNext, onPageChange }) {
  if (numPages <= 1) return null

  return (
    <nav className="pagination-bar" aria-label="Paginación del catálogo">
      <button
        type="button"
        className="page-btn"
        disabled={!hasPrevious}
        onClick={() => onPageChange(page - 1)}
      >
        <span aria-hidden="true">‹</span>
        <span className="visually-hidden">Página anterior</span>
      </button>

      {buildPageList(page, numPages).map((item, index) =>
        item === '…' ? (
          <span key={`ellipsis-${index}`} className="page-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`page-btn${item === page ? ' is-active' : ''}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="page-btn"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        <span aria-hidden="true">›</span>
        <span className="visually-hidden">Página siguiente</span>
      </button>
    </nav>
  )
}
