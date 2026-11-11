import { Link } from 'react-router-dom'

export default function AdminPage() {
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <p className="section-kicker">Acceso restringido</p>
        <h1>Panel de administración</h1>
        <p>
          Aquí irá la administración de Piñatiks: diseños, fotos, categorías y etiquetas del
          catálogo.
        </p>
        <Link className="btn btn-sun" to="/">
          ← Volver al inicio
        </Link>
      </div>
    </main>
  )
}
