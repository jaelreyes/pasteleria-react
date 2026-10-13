import Navigation from './Navigation'

function Header({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
}) {
  return (
    <header className="site-header">
      <Navigation
        cantidad={cantidad}
        onVerCarrito={onVerCarrito}
        usuarioActivo={usuarioActivo}
        onCerrarSesion={onCerrarSesion}
      />
    </header>
  )
}

export default Header