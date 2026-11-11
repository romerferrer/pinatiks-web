import { Link, useParams } from 'react-router-dom'

export default function OfferingDetailPage() {
  const { slug } = useParams()

  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <p className="section-kicker">Próximamente</p>
        <h1>Aquí van los detalles de la decoración</h1>
        <p>
          Esta página mostrará las fotos, la descripción completa y la forma de reservar cada
          diseño del catálogo.
        </p>
        {slug && (
          <p className="placeholder-slug">
            Oferta: <code>{slug}</code>
          </p>
        )}
        <Link className="btn btn-sun" to="/">
          ← Volver al catálogo
        </Link>
      </div>
    </main>
  )
}
