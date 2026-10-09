import { Link } from "react-router-dom";
import "../styles/Home.css";
import productos from "../data/productos";

const categorias = [
  {
    nombre: "Tortas Cuadradas",
    imagen: "TC001.jpg",
    descripcion: "Chocolate y frutas, personalizables con tu mensaje.",
  },
  {
    nombre: "Tortas Circulares",
    imagen: "TT001.jpg",
    descripcion: "Vainilla, manjar y los clásicos de siempre.",
  },
  {
    nombre: "Postres Individuales",
    imagen: "PI001.jpg",
    descripcion: "Mousse, tiramisú y porciones para uno.",
  },
  {
    nombre: "Productos Sin Azúcar",
    imagen: "PSA001.jpg",
    descripcion: "Endulzados naturalmente, para disfrutar sin culpa.",
  },
  {
    nombre: "Pastelería Tradicional",
    imagen: "PT001.jpg",
    descripcion: "Empanadas de manzana y tarta de Santiago.",
  },
  {
    nombre: "Productos Sin Gluten",
    imagen: "PG002.jpg",
    descripcion: "Brownies y pan sin gluten, sin perder sabor.",
  },
  {
    nombre: "Productos Veganos",
    filtro: "Productos Vegana",
    imagen: "PV002.jpg",
    descripcion: "Sin ingredientes de origen animal.",
  },
  {
    nombre: "Tortas Especiales",
    imagen: "TE001.jpg",
    descripcion: "Cumpleaños y bodas, diseñadas a tu medida.",
  },
];

const codigosDestacados = ["TC001", "TT002", "PI002"];

const productosDestacados = codigosDestacados
  .map((codigo) => productos.find((producto) => producto.codigo === codigo))
  .filter(Boolean);

function Home() {
  return (
    <div className="home-page">
      {/* Portada */}
      <section className="home-hero">
        <div className="home-hero-contenido">
          <h1>
            Pastelería <span>1000 Sabores</span>
          </h1>

          <p>
            Repostería artesanal con los mejores ingredientes y sabores únicos
            que enamoran
          </p>

          <Link to="/productos" className="home-btn">
            Ver Productos
          </Link>
        </div>
      </section>

      {/* Categorías */}
      <section className="home-categorias">
        <h2 className="home-seccion-titulo">Nuestras Categorías</h2>

        <div className="home-categorias-grid">
          {categorias.map((categoria) => (
            <Link
              key={categoria.nombre}
              to={`/productos?${new URLSearchParams({
                categoria: categoria.filtro || categoria.nombre,
              }).toString()}`}
              className="home-categoria-card"
            >
              <div className="home-categoria-foto">
                <img
                  src={`/images/productos/${categoria.imagen}`}
                  alt={categoria.nombre}
                  loading="lazy"
                />
              </div>

              <h3>{categoria.nombre}</h3>
              <p>{categoria.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos estrella */}
      <section className="home-destacados">
        <h2 className="home-seccion-titulo">Productos Estrella</h2>

        <div className="home-destacados-grid">
          {productosDestacados.map((producto) => (
            <article key={producto.codigo} className="home-producto-card">
              <img src={producto.imagen} alt={producto.nombre} loading="lazy" />

              <div className="home-producto-info">
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>

                <span className="home-producto-precio">
                  ${producto.precio.toLocaleString("es-CL")}
                </span>

                <Link
                  to={`/productos/${producto.id}`}
                  className="home-btn-detalle"
                >
                  Ver Detalle
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/productos" className="home-btn">
            Ver Todos los Productos →
          </Link>
        </div>
      </section>

      {/* Video */}
      <section className="home-video">
        <h2 className="home-seccion-titulo">Conoce Nuestra Historia</h2>

        <figure>
          <div className="home-video-contenedor">
            <iframe
              src="https://www.youtube.com/embed/41pc_NyeF-w"
              title="Reportaje sobre la cultura de la pastelería artesanal"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <figcaption>
            El oficio detrás de cada torta: un recorrido por la pastelería
            artesanal.
          </figcaption>
        </figure>
      </section>

      {/* Presentación de la historia */}
      <section className="home-historia">
        <div>
          <h2>50 años endulzando Chile</h2>

          <p>
            Desde 1975, Pastelería 1000 Sabores ha sido el lugar donde los
            sueños dulces se hacen realidad. En 1995 participamos en el récord
            Guinness de la torta más grande del mundo, y hoy celebramos nuestro
            50º aniversario con la misma receta de siempre: amor, tradición e
            ingredientes naturales.
          </p>

          <Link to="/nosotros" className="home-btn-historia">
            Conoce Más →
          </Link>
        </div>

        <img
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop"
          alt="Nuestra pastelera"
          loading="lazy"
        />
      </section>

      {/* Invitación final */}
      <section className="home-cta">
        <h2>¿Listo para Endulzar tu Día?</h2>
        <p>Explora nuestros más de 100 sabores y encuentra tu favorito</p>

        <Link to="/productos" className="home-btn-detalle">
          Explorar Menú
        </Link>
      </section>
    </div>
  );
}

export default Home;
