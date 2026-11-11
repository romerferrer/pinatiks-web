import { Link } from 'react-router-dom'
import { photoUrl } from '../api/catalog'

export default function OfferingCard({ offering }) {
  const cover = offering.photos?.[0]

  return (
    <article className="offering-card h-100">
      <Link className="offering-card-link" to={`/oferta/${offering.slug}`}>
        <div className="offering-media">
          {cover ? (
            <img src={photoUrl(cover.url)} alt={cover.alt_text || offering.name} loading="lazy" />
          ) : (
            <div className="offering-media-placeholder" aria-hidden="true">
              🪅
            </div>
          )}
        </div>
        <div className="offering-body">
          {offering.category && <span className="badge-category">{offering.category}</span>}
          <h3 className="offering-name">{offering.name}</h3>
          {offering.description && <p className="offering-description">{offering.description}</p>}
          {offering.requires_booking && (
            <span className="badge-booking">Requiere reservación</span>
          )}
        </div>
      </Link>
    </article>
  )
}
