import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

/**
 * Desenrolla la respuesta { status: 'success', data } del backend.
 * Si el servidor respondió con un error (con o sin status HTTP de error),
 * lanza un Error con el mensaje del servidor.
 */
function unwrap(response) {
  const body = response?.data
  if (body?.status === 'success') return body.data
  throw new Error(body?.message || 'El servidor respondió con un formato inesperado.')
}

async function get(path, config = {}) {
  let response
  try {
    response = await api.get(path, config)
  } catch (err) {
    // Las cancelaciones (cambio rápido de filtros) no son errores para el usuario.
    if (err.code === 'ERR_CANCELED' || err.code === 'ERR_ABORTED') throw err
    const message = err.response?.data?.message
    throw new Error(
      message || 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    )
  }
  return unwrap(response)
}

/** Lista de nombres de categorías existentes. */
export async function getCategories() {
  const data = await get('catalog/categories/')
  return Array.isArray(data) ? data : []
}

/** Lista de nombres de etiquetas existentes. */
export async function getTags() {
  const data = await get('catalog/tags/')
  return Array.isArray(data) ? data : []
}

/**
 * Página de ofertas del catálogo, ya normalizada:
 * { count, numPages, page, hasNext, hasPrevious, results }
 */
export async function getOfferings(
  { q = '', category = '', tags = [], page = 1 } = {},
  { signal } = {},
) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  for (const tag of tags) params.append('tag', tag)
  params.set('page', String(page))

  const data = await get('catalog/offerings/', { params, signal })
  return {
    count: data?.count ?? 0,
    numPages: data?.num_pages ?? 1,
    page: data?.page ?? 1,
    hasNext: Boolean(data?.has_next),
    hasPrevious: Boolean(data?.has_previous),
    results: Array.isArray(data?.results) ? data.results : [],
  }
}

/**
 * Las fotos pueden llegar como rutas relativas (/media/...);
 * se resuelven contra el origen de la API para que siempre carguen.
 */
export function photoUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  try {
    const base = api.defaults.baseURL || window.location.origin
    return new URL(url, base).toString()
  } catch {
    return url
  }
}
