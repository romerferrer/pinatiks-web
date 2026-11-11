import { useEffect, useRef } from 'react'
// Módulo individual de Bootstrap (solo el carrusel, sin todo el paquete).
import * as carouselModule from 'bootstrap/js/dist/carousel.js'
import logo from '../assets/logo-simplified.png'

const BootstrapCarousel = carouselModule.default ?? carouselModule

const SLIDES = [
  {
    key: 'sunflower',
    className: 'slide-sunflower',
    logo: true,
    kicker: 'Bienvenidos a Piñatiks',
    title: '¡Hagamos tu fiesta inolvidable!',
    text: 'Piñatas, arreglos de globos, mesas de dulces y más detalles hechos a mano para tu celebración.',
    ctaLabel: 'Ver catálogo',
    ctaHref: '#catalogo',
  },
  {
    key: 'party',
    className: 'slide-party',
    kicker: 'Piñatas personalizadas',
    title: 'Cuéntanos tu idea y la creamos',
    text: 'Personajes, colores y tamaños para todas las edades. ¿Cuál es tu favorito?',
    ctaLabel: 'Contáctanos',
    ctaHref: '#contacto',
  },
  {
    key: 'candy',
    className: 'slide-candy',
    kicker: 'Decoración completa',
    title: 'Todo listo para tu evento',
    text: 'Globos, dulces y detalles artesanales que transforman cualquier lugar.',
    ctaLabel: 'Conócenos',
    ctaHref: '#nosotros',
  },
]

export default function Carousel() {
  const elementRef = useRef(null)

  useEffect(() => {
    const carousel = new BootstrapCarousel(elementRef.current, {
      interval: 5000,
      ride: 'carousel',
      touch: true,
      pause: 'hover',
    })
    return () => carousel.dispose()
  }, [])

  return (
    <section className="hero" aria-label="Presentación de Piñatiks">
      <div className="carousel slide hero-carousel" id="hero-carousel" ref={elementRef}>
        <div className="carousel-indicators">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              data-bs-target="#hero-carousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-current={index === 0 ? 'true' : undefined}
              aria-label={`Ir a la diapositiva ${index + 1}`}
            />
          ))}
        </div>

        <div className="carousel-inner">
          {SLIDES.map((slide, index) => (
            <div className={`carousel-item${index === 0 ? ' active' : ''}`} key={slide.key}>
              <div className={`slide ${slide.className}`}>
                <div className="container slide-inner">
                  {slide.logo && <img className="slide-logo" src={logo} alt="" aria-hidden="true" />}
                  <p className="slide-kicker">{slide.kicker}</p>
                  <h2 className="slide-title">{slide.title}</h2>
                  <p className="slide-text">{slide.text}</p>
                  <a className="btn btn-sun btn-lg slide-cta" href={slide.ctaHref}>
                    {slide.ctaLabel}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#hero-carousel"
          data-bs-slide="prev"
        >
          <span className="visually-hidden">Diapositiva anterior</span>
          <svg
            className="slide-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#hero-carousel"
          data-bs-slide="next"
        >
          <span className="visually-hidden">Diapositiva siguiente</span>
          <svg
            className="slide-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
