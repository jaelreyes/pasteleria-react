import Navigation from './Navigation'

// Encabezado del sitio: solo contiene la barra de navegación.
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