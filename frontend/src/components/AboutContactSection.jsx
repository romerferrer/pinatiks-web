import logo from '../assets/logo-simplified.png'

// TODO: reemplazar con la información real del negocio (teléfono, redes, correo).
const CONTACT_LINKS = [
  {
    key: 'whatsapp',
    href: 'https://wa.me/56975943641',
    label: 'WhatsApp',
    value: 'Escríbenos y cotiza tu fiesta',
    external: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/pinatiks',
    label: 'Instagram',
    value: '@pinatiks',
    external: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'email',
    href: 'mailto:lissethferrer23@gmail.com',
    label: 'Correo',
    value: 'lissethferrer23@gmail.com',
    external: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
]

export default function AboutContactSection() {
  return (
    <>
      <section id="nosotros" className="about-section" aria-labelledby="nosotros-title">
        <div className="container">
          <header className="section-head">
            <p className="section-kicker">Nosotros</p>
            <h2 id="nosotros-title">Detalles hechos a mano para acompañar tus momentos más felices.</h2>
            <p className="section-sub"></p>
          </header>

          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-md-5">
              <img
                className="about-logo d-block mx-auto"
                src={logo}
                alt="Logotipo de Piñatiks"
                width="480"
                height="370"
              />
            </div>
            <div className="col-12 col-md-7">
              {/* TODO: texto real de la dueña del negocio. */}
              <p className="about-text">
                En Piñatiks creemos que cada fiesta merece detalles únicos. Diseñamos y elaboramos
                decoraciones con mucho cariño: desde la piñata que todos quieren reventar hasta
                la mesa de dulces que roba miradas.
              </p>
              <ul className="about-list">
                <li>Piñatas tradicionales y personalizadas</li>
                <li>Arreglos de globos para toda ocasión</li>
                <li>Mesas de dulces y postres</li>
                <li>Otros detalles para tu evento</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="contact-section" aria-labelledby="contacto-title">
        <div className="container">
          <header className="section-head">
            <p className="section-kicker">Contacto</p>
            <h2 id="contacto-title">Platiquemos de tu fiesta</h2>
            <p className="section-sub">Cuéntanos qué celebras y juntos lo hacemos realidad.</p>
          </header>

          <div className="row justify-content-center g-3 g-md-4">
            {CONTACT_LINKS.map((contact) => (
              <div className="col-12 col-sm-6 col-lg-4" key={contact.key}>
                <a
                  className="contact-card h-100"
                  href={contact.href}
                  {...(contact.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  <span className={`contact-icon contact-icon--${contact.key}`}>
                    {contact.icon}
                  </span>
                  <span className="contact-label">{contact.label}</span>
                  <span className="contact-value">{contact.value}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
