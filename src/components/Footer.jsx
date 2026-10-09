import { useState } from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [suscrito, setSuscrito] = useState(false)

  function suscribir(evento) {
    evento.preventDefault()

    const valor = correo.trim()
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (valor.length > 100 || !correoValido.test(valor)) {
      setError('Ingresa un correo electrónico válido de máximo 100 caracteres.')
      return
    }

    // Confirmación simulada: todavía no enviamos datos a un servidor.
    setError('')
    setSuscrito(true)
    setCorreo('')
  }

  return (
    <footer className="site-footer">
      <div className="footer-contenido">
        <section className="footer-col">
          <h2>Pastelería 1000 Sabores</h2>
          <p>
            Cincuenta años de repostería artesanal. Los mejores
            sabores para los momentos más dulces de tu vida.
          </p>
        </section>

        <section className="footer-col">
          <h2>Enlaces</h2>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Productos</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </section>

        <section className="footer-col">
          <h2>Contacto</h2>
          <ul>
            <li>Av. Dulce 123, Santiago</li>
            <li>
              <a href="tel:+56912345678">+56 9 1234 5678</a>
            </li>
            <li>
              <a href="mailto:contacto@1000sabores.cl">
                contacto@1000sabores.cl
              </a>
            </li>
            <li>Lun-Dom: 9:00 - 20:00</li>
          </ul>
        </section>

        <section className="footer-col">
          <h2>Redes Sociales</h2>
          <div className="redes-sociales">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook, abre una pestaña nueva"
            >
              Facebook
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram, abre una pestaña nueva"
            >
              Instagram
            </a>

            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok, abre una pestaña nueva"
            >
              TikTok
            </a>
          </div>
        </section>

        <section className="footer-col">
          <h2>Newsletter</h2>
          <p>
            Suscríbete y entérate de nuestras novedades y promociones.
          </p>

          {suscrito ? (
            <p role="status">¡Gracias! Ya estás suscrito.</p>
          ) : (
            <form onSubmit={suscribir} noValidate>
              <label
                className="visually-hidden"
                htmlFor="correo-newsletter"
              >
                Correo electrónico para el newsletter
              </label>

              <div className="newsletter-fila">
                <input
                  id="correo-newsletter"
                  type="email"
                  autoComplete="email"
                  placeholder="tunombre@duoc.cl"
                  maxLength={100}
                  value={correo}
                  onChange={evento => setCorreo(evento.target.value)}
                  aria-describedby="error-newsletter"
                  aria-invalid={Boolean(error)}
                  required
                />

                <button type="submit">Suscribirse</button>
              </div>

              <p id="error-newsletter" className="newsletter-error" role="alert">
                {error}
              </p>
            </form>
          )}
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 Pastelería 1000 Sabores. Todos los derechos reservados.
        </p>

        <ul className="medios-pago" aria-label="Medios de pago aceptados">
          <li>Visa</li>
          <li>Mastercard</li>
          <li>American Express</li>
          <li>Webpay</li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer