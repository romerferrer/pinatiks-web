import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCategories, getOfferings, getTags } from '../api/catalog'
import OfferingCard from './OfferingCard.jsx'
import Pagination from './Pagination.jsx'

/** Construye parámetros limpios para la URL (sin campos vacíos). */
function buildUrlParams({ q = '', category = '', tags = [], page = 1 }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  for (const tag of tags) params.append('tag', tag)
  if (page > 1) params.set('page', String(page))
  return params
}

export default function CatalogSection() {
  const [searchParams, setSearchParams] = useSearchParams()

  // El estado de los filtros vive en la URL: se puede compartir y usar atrás/adelante.
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const tags = useMemo(() => searchParams.getAll('tag'), [searchParams])
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  // Texto del buscador. Si la URL cambia (botones atrás/adelante), se ajusta
  // durante el render en lugar de con un efecto.
  const [searchText, setSearchText] = useState(q)
  const [committedQ, setCommittedQ] = useState(q)
  if (q !== committedQ) {
    setCommittedQ(q)
    setSearchText(q)
  }

  // Filtros disponibles (se piden una sola vez).
  const [categories, setCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [filtersError, setFiltersError] = useState('')

  // Resultados de la petición más reciente, junto a los filtros con los que se
  // pidieron. Si no coinciden con los filtros actuales, se considera "cargando".
  const [fetchState, setFetchState] = useState({ key: null, results: null, error: '' })
  const resultsRef = useRef(null)

  const filters = useMemo(() => ({ q, category, tags, page }), [q, category, tags, page])
  const filtersKey = `${q}|${category}|${tags.join('\u0000')}|${page}`
  const stale = fetchState.key !== filtersKey
  const loading = stale
  const error = stale ? '' : fetchState.error
  const results = stale ? null : fetchState.results

  const filtersActive = Boolean(q || category || tags.length > 0)

  // Categorías y etiquetas disponibles (se piden una sola vez).
  useEffect(() => {
    let cancelled = false
    Promise.all([getCategories(), getTags()])
      .then(([categoryList, tagList]) => {
        if (cancelled) return
        setCategories(categoryList)
        setAllTags(tagList)
      })
      .catch((err) => {
        if (!cancelled) setFiltersError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Búsqueda con retardo: el texto pasa a la URL, que es la única fuente de verdad.
  useEffect(() => {
    if (searchText === q) return
    const timer = setTimeout(() => {
      setSearchParams(
        (previous) =>
          buildUrlParams({
            q: searchText,
            category: previous.get('category') ?? '',
            tags: previous.getAll('tag'),
            page: 1,
          }),
        { replace: true },
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [searchText, q, setSearchParams])

  // Página de resultados según los filtros de la URL.
  // Las peticiones viejas se cancelan al cambiar algo.
  useEffect(() => {
    const controller = new AbortController()
    getOfferings(filters, { signal: controller.signal })
      .then((data) => {
        setFetchState({ key: filtersKey, results: data, error: '' })
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return
        setFetchState({ key: filtersKey, results: null, error: err.message })
      })
    return () => controller.abort()
  }, [filters, filtersKey])

  function handleSearchSubmit(event) {
    event.preventDefault()
    if (searchText === q) return
    setSearchParams(buildUrlParams({ q: searchText, category, tags, page: 1 }))
  }

  function handleCategory(nextCategory) {
    setSearchParams(buildUrlParams({ q, category: nextCategory, tags, page: 1 }))
  }

  function handleTag(tag) {
    const nextTags = tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]
    setSearchParams(buildUrlParams({ q, category, tags: nextTags, page: 1 }))
  }

  function clearFilters() {
    setSearchParams(buildUrlParams({}))
  }

  function goToPage(nextPage) {
    setSearchParams(buildUrlParams({ q, category, tags, page: nextPage }))
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section id="catalogo" className="catalog-section" aria-labelledby="catalogo-title">
      <div className="container">
        <header className="section-head">
          <p className="section-kicker">Catálogo</p>
          <h2 id="catalogo-title">Encuentra la decoración perfecta</h2>
          <p className="section-sub">Busca, filtra por categoría o etiqueta y elige tus favoritos.</p>
        </header>

        <div className="catalog-controls">
          <form className="search-form" role="search" onSubmit={handleSearchSubmit}>
            <label className="visually-hidden" htmlFor="catalog-search">
              Buscar en el catálogo
            </label>
            <input
              id="catalog-search"
              className="search-input"
              type="search"
              placeholder="¿Qué buscas? Ej. piñata de unicornio"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button className="btn btn-sun search-btn" type="submit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="d-none d-sm-inline">Buscar</span>
            </button>
          </form>

          {filtersError && (
            <div className="alert alert-soft mt-3 mb-0" role="alert">
              No pudimos cargar las categorías y etiquetas: {filtersError}
            </div>
          )}

          {categories.length > 0 && (
            <div className="filter-group">
              <h3 className="filter-label">Categorías</h3>
              <div className="chip-row">
                <button
                  type="button"
                  className={`chip${category === '' ? ' is-active' : ''}`}
                  onClick={() => handleCategory('')}
                >
                  Todas
                </button>
                {categories.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`chip${category === name ? ' is-active' : ''}`}
                    onClick={() => handleCategory(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allTags.length > 0 && (
            <div className="filter-group">
              <h3 className="filter-label">Etiquetas</h3>
              <div className="chip-row">
                {allTags.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`chip chip--tag${tags.includes(name) ? ' is-active' : ''}`}
                    aria-pressed={tags.includes(name)}
                    onClick={() => handleTag(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="catalog-results" ref={resultsRef}>
          <div className="catalog-meta">
            {results && !error && (
              <p className="results-count">
                {results.count} {results.count === 1 ? 'diseño' : 'diseños'}
                {filtersActive ? ' encontrados' : ''}
              </p>
            )}
            {filtersActive && (
              <button type="button" className="btn-link-clear" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>

          {loading && (
            <div className="catalog-status" role="status">
              <span className="spinner-border" aria-hidden="true" />
              <p>Cargando diseños…</p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-soft" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && results && results.results.length === 0 && (
            <div className="catalog-status">
              <p className="empty-title">No encontramos nada 😕</p>
              <p>Prueba con otra búsqueda o quita algunos filtros.</p>
              {filtersActive && (
                <button type="button" className="btn btn-sun mt-3" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {!loading && !error && results && results.results.length > 0 && (
            <>
              <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-md-4">
                {results.results.map((offering) => (
                  <div className="col" key={offering.id}>
                    <OfferingCard offering={offering} />
                  </div>
                ))}
              </div>
              <Pagination
                page={results.page}
                numPages={results.numPages}
                hasPrevious={results.hasPrevious}
                hasNext={results.hasNext}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
