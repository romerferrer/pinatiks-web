import { Link } from 'react-router-dom'

// El año se calcula una sola vez al cargar el módulo (fuera del render).
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <p className="footer-brand">Piñatiks 🌻</p>
            <p className="footer-tagline">Decoración de fiestas hecha con cariño.</p>
          </div>
          <nav className="footer-links" aria-label="Enlaces del sitio">
            <a href="#inicio">Inicio</a>
            <a href="#catalogo">Catálogo</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {CURRENT_YEAR} Piñatiks · Todos los derechos reservados</p>
          {/* Acceso rápido y discreto a la administración */}
          <Link className="admin-link" to="/admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
