import { Link } from "react-router-dom";
import "../styles/Nosotros.css";

// Valores de la pastelería (tarjetas de la sección Valores).
const valores = [
  {
    nombre: "Pasión",
    descripcion:
      "Cada pieza es elaborada con amor y dedicación, como si fuera para nuestra propia familia.",
    imagen:
      "https://images.unsplash.com/photo-1537734796389-e1fc293cf856?w=600&h=420&fit=crop",
    alt: "Manos de pastelero trabajando una masa",
  },
  {
    nombre: "Calidad",
    descripcion:
      "Utilizamos solo los mejores ingredientes naturales, sin conservantes artificiales.",
    imagen:
      "https://images.unsplash.com/photo-1588467850695-a898367ce465?w=600&h=420&fit=crop",
    alt: "Ingredientes para preparar repostería",
  },
  {
    nombre: "Compromiso",
    descripcion:
      "Cumplimos cada encargo con puntualidad y superamos las expectativas de nuestros clientes.",
    imagen:
      "https://images.unsplash.com/photo-1557952138-7ed256c23bc5?w=600&h=420&fit=crop",
    alt: "Pedido de repostería preparado para entregar",
  },
  {
    nombre: "Innovación",
    descripcion:
      "Constantemente creamos nuevos sabores y diseños para sorprenderte.",
    imagen:
      "https://images.unsplash.com/photo-1581016327131-6cf17ab1f2c1?w=600&h=420&fit=crop",
    alt: "Decoración de repostería con crema rosa",
  },
];

// Integrantes del equipo que se muestran en tarjetas.
const equipoPasteleria = [
  {
    nombre: "María García",
    cargo: "Fundadora y Pastelera Jefe",
    descripcion: "Más de 30 años de experiencia en repostería artesanal.",
    imagen:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=face",
  },
  {
    nombre: "Carlos Rodríguez",
    cargo: "Chef Pastelero",
    descripcion: "Especialista en tortas decoradas y chocolate belga.",
    imagen:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    nombre: "Ana Martínez",
    cargo: "Panadera",
    descripcion: "Maestra del pan artesanal y la masa fermentada.",
    imagen:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
  },
];

// Página Nosotros: historia, misión y visión, video, valores y equipo.
function Nosotros() {
  return (
    <div className="nosotros-page">
      <section className="nosotros-hero">
        <h1>Nuestra Historia</h1>
        <p>Medio siglo creando momentos dulces</p>
      </section>

      {/* Historia */}
      <section className="nosotros-historia">
        <div className="nosotros-historia-contenido">
          <h2>De un sueño a una tradición</h2>

          <p>
            Pastelería 1000 Sabores nació en 1975 del sueño de Doña
            María García, una apasionada de la repostería que comenzó
            a hornear en su cocina familiar con recetas transmitidas
            por generaciones.
          </p>

          <p>
            Lo que empezó como un pequeño emprendimiento en el barrio
            se convirtió en un referente de la repostería artesanal
            en Santiago. Cada torta, cada cupcake y cada pieza de pan
            lleva el sello de la calidad y el amor que le ponemos
            a nuestro trabajo.
          </p>

          <p>
            En 1995 vivimos nuestro momento más recordado: colaboramos
            en la creación de la torta más grande del mundo, un récord
            Guinness que todavía nos enorgullece y que marcó a toda
            una generación de pasteleros chilenos.
          </p>

          <p>
            Hoy celebramos nuestro 50º aniversario fieles a los mismos
            valores: ingredientes naturales, recetas tradicionales y
            la sonrisa de nuestros clientes como nuestra mayor recompensa.
          </p>
        </div>

        <div className="nosotros-historia-imagen">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=450&h=450&fit=crop"
            alt="Nuestra pastelera preparando un bizcocho"
            loading="lazy"
          />
        </div>
      </section>

      <section
        className="nosotros-mision-vision"
        aria-label="Misión y visión"
      >
        <article className="nosotros-mv-card">
          <h2>Nuestra Misión</h2>
          <p>
            Ofrecer una experiencia dulce y memorable a nuestros
            clientes, proporcionando tortas y productos de
            repostería de alta calidad para todas las ocasiones,
            mientras celebramos nuestras raíces históricas y
            fomentamos la creatividad en la repostería.
          </p>
        </article>

        <article className="nosotros-mv-card">
          <h2>Nuestra Visión</h2>
          <p>
            Convertirnos en la tienda online líder de productos
            de repostería en Chile, conocida por nuestra innovación,
            calidad y el impacto positivo en la comunidad,
            especialmente en la formación de nuevos talentos
            en gastronomía.
          </p>
        </article>
      </section>

      {/* Video */}
      <section className="nosotros-video">
        <h2>Conoce Nuestro Mundo</h2>
        <p>Un vistazo a cómo creamos nuestros dulces favoritos</p>

        <figure>
          <div className="nosotros-video-contenedor">
            <iframe
              src="https://www.youtube.com/embed/KX-7KnPD1JA"
              title="Los secretos de la pastelería francesa explicados por una experta"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <figcaption>
            Las técnicas clásicas que inspiran nuestras recetas desde 1975.
          </figcaption>
        </figure>
      </section>

      {/* Valores (se generan con map) */}
      <section className="nosotros-valores">
        <h2>Nuestros Valores</h2>

        <p className="nosotros-intro">
          Cuatro principios que guían cada receta que sale de nuestro horno.
        </p>

        <div className="nosotros-valores-grid">
          {valores.map((valor) => (
            <article key={valor.nombre} className="nosotros-valor-card">
              <div className="nosotros-valor-foto">
                <img
                  src={valor.imagen}
                  alt={valor.alt}
                  loading="lazy"
                />
              </div>

              <h3>{valor.nombre}</h3>
              <p>{valor.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Equipo (se genera con map) */}
      <section className="nosotros-equipo">
        <h2>Nuestro Equipo</h2>

        <div className="nosotros-equipo-grid">
          {equipoPasteleria.map((persona) => (
            <article
              key={persona.nombre}
              className="nosotros-miembro-card"
            >
              <img
                className="nosotros-miembro-foto"
                src={persona.imagen}
                alt={persona.nombre}
                loading="lazy"
                width={120}
                height={120}
              />

              <h3>{persona.nombre}</h3>

              <p className="nosotros-miembro-cargo">
                {persona.cargo}
              </p>

              <p className="nosotros-miembro-bio">
                {persona.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Invitación a contactarnos */}
      <section className="nosotros-cta">
        <h2>¿Quieres Conocernos?</h2>
        <p>Visítanos y descubre por qué somos los favoritos del barrio</p>

        <div className="nosotros-cta-botones">
          <Link to="/contacto" className="nosotros-boton">
            Contáctanos
          </Link>

          <Link
            to="/productos"
            className="nosotros-boton nosotros-boton-secundario"
          >
            Ver Productos
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Nosotros;