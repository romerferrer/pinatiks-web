import Header from '../components/Header.jsx'
import Carousel from '../components/Carousel.jsx'
import CatalogSection from '../components/CatalogSection.jsx'
import AboutContactSection from '../components/AboutContactSection.jsx'
import Footer from '../components/Footer.jsx'

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="inicio">
        {/* Título principal de la página (visible para lectores y buscadores). */}
        <h1 className="visually-hidden">Piñatiks · Piñatas y decoración de fiestas</h1>
        <Carousel />
        <CatalogSection />
        <AboutContactSection />
      </main>
      <Footer />
    </>
  )
}
