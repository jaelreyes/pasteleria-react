import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import Footer from './Footer'

function Layout({ cantidad }) {
  return (
    <div>
      <Header />
      <Navigation cantidad={cantidad} />

      <main>
        {/* Aquí se muestra la página de la ruta seleccionada */}
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout