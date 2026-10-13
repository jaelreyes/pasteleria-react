import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Layout({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
}) {
  const ubicacion = useLocation()
  const esInicio = ubicacion.pathname === '/'

  return (
    <div className="site-layout">
      <Header
        cantidad={cantidad}
        onVerCarrito={onVerCarrito}
        usuarioActivo={usuarioActivo}
        onCerrarSesion={onCerrarSesion}
      />

      <main className={`site-main${esInicio ? ' site-main-home' : ''}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout