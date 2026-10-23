import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Layout({
  cantidad,
  onVerCarrito,
  usuarioActivo,
  onCerrarSesion,
}) {
  const ubicacion = useLocation();

  const anchoCompleto =
  ubicacion.pathname === "/" ||
  ubicacion.pathname === "/n osotros" ||
  ubicacion.pathname === "/contacto" ||
  ubicacion.pathname === "/login" ||
  ubicacion.pathname === "/registro";

  return (
    <div className="site-layout">
      <Header
        cantidad={cantidad}
        onVerCarrito={onVerCarrito}
        usuarioActivo={usuarioActivo}
        onCerrarSesion={onCerrarSesion}
      />

      <main
        className={`site-main${anchoCompleto ? " site-main-home" : ""}`}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;