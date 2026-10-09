import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Layout({ cantidad, onVerCarrito }) {
  const ubicacion = useLocation()
  const esInicio = ubicacion.pathname === '/'

  return (
    <div className="site-layout">
      <Header
        cantidad={cantidad}
        onVerCarrito={onVerCarrito}
      />

      <main className={`site-main${esInicio ? ' site-main-home' : ''}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout