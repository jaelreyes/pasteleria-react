import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Estructura común de la tienda: Header, contenido de la ruta (Outlet) y Footer.
function Layout({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
  avisoCatalogo,
  ocultarContenido = false,
}) {
  const { pathname } = useLocation()

  // Páginas que ocupan todo el ancho de la pantalla.
  const rutasAnchoCompleto = [
    '/',
    '/nosotros',
    '/contacto',
    '/login',
    '/registro',
  ]

  const anchoCompleto = rutasAnchoCompleto.includes(pathname)

  return (
    <div className="site-layout">
      <Header
        cantidad={cantidad}
        onVerCarrito={onVerCarrito}
        usuarioActivo={usuarioActivo}
        onCerrarSesion={onCerrarSesion}
      />

      <main
        className={`site-main${anchoCompleto ? ' site-main-home' : ''}`}
      >
        {/* Aquí se dibuja la página de la ruta actual */}
        {avisoCatalogo}
        {!ocultarContenido && <Outlet />}
      </main>

      <Footer />
    </div>
  )
}

export default Layout
