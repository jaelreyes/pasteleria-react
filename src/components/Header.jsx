import Navigation from './Navigation'

function Header({ cantidad, onVerCarrito }) {
  return (
    <header className="site-header">
      <Navigation
        cantidad={cantidad}
        onVerCarrito={onVerCarrito}
      />
    </header>
  )
}

export default Header