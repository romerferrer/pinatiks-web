import { useState } from 'react'
import logo from '../assets/logo-simplified.png'

const SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header sticky-top">
      <nav className="navbar navbar-expand-md container" aria-label="Navegación principal">
        <a
          className="navbar-brand d-flex align-items-center gap-2"
          href="#inicio"
          onClick={() => setOpen(false)}
        >
          <img className="brand-logo" src={logo} alt="Logotipo de Piñatiks" width="60" height="46" />
          <span className="brand-name">Piñatiks</span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="menu-principal"
          aria-expanded={open}
          aria-label={open ? 'Cerrar el menú' : 'Abrir el menú'}
          onClick={() => setOpen(!open)}
        >
          <span className="burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="menu-principal">
          <ul className="navbar-nav ms-auto mb-2 mb-md-0">
            {SECTIONS.map((section) => (
              <li className="nav-item" key={section.id}>
                <a className="nav-link" href={`#${section.id}`} onClick={() => setOpen(false)}>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
