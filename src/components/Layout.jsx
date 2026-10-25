import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Layout({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
}) {
  const { pathname } = useLocation()

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
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout