import { Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const valores = [
  {
    nombre: 'Pasión',
    descripcion:
      'Cada pieza es elaborada con amor y dedicación, como si fuera para nuestra propia familia.',
  },
  {
    nombre: 'Calidad',
    descripcion:
      'Utilizamos solo los mejores ingredientes naturales, sin conservantes artificiales.',
  },
  {
    nombre: 'Compromiso',
    descripcion:
      'Cumplimos cada encargo con puntualidad y superamos las expectativas de nuestros clientes.',
  },
  {
    nombre: 'Innovación',
    descripcion:
      'Constantemente creamos nuevos sabores y diseños para sorprenderte.',
  },
]

const equipoPasteleria = [
  {
    nombre: 'María García',
    cargo: 'Fundadora y Pastelera Jefe',
    descripcion: 'Más de 30 años de experiencia en repostería artesanal.',
  },
  {
    nombre: 'Carlos Rodríguez',
    cargo: 'Chef Pastelero',
    descripcion: 'Especialista en tortas decoradas y chocolate belga.',
  },
  {
    nombre: 'Ana Martínez',
    cargo: 'Panadera',
    descripcion: 'Maestra del pan artesanal y la masa fermentada.',
  },
]



function Nosotros() {
  return (
    <>
      <section className="mb-5">
        <h1>Nuestra Historia</h1>
        <p className="lead">Medio siglo creando momentos dulces</p>

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
      </section>

      <section className="mb-5" aria-label="Misión y visión">
        <Row xs={1} md={2} className="g-4">
          <Col>
            <Card className="h-100">
              <Card.Body>
                <Card.Title as="h2">Nuestra Misión</Card.Title>
                <Card.Text>
                  Ofrecer una experiencia dulce y memorable a nuestros
                  clientes, proporcionando tortas y productos de
                  repostería de alta calidad para todas las ocasiones,
                  mientras celebramos nuestras raíces históricas y
                  fomentamos la creatividad en la repostería.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100">
              <Card.Body>
                <Card.Title as="h2">Nuestra Visión</Card.Title>
                <Card.Text>
                  Convertirnos en la tienda online líder de productos
                  de repostería en Chile, conocida por nuestra innovación,
                  calidad y el impacto positivo en la comunidad,
                  especialmente en la formación de nuevos talentos
                  en gastronomía.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <h2>Conoce Nuestro Mundo</h2>
        <p>Un vistazo a cómo creamos nuestros dulces favoritos.</p>
        <p>Las técnicas clásicas que inspiran nuestras recetas desde 1975.</p>
      </section>

      <section className="mb-5">
        <h2>Nuestros Valores</h2>
        <p>Cuatro principios que guían cada receta que sale de nuestro horno.</p>

        <Row xs={1} sm={2} lg={4} className="g-4">
          {valores.map(valor => (
            <Col key={valor.nombre}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title as="h3">{valor.nombre}</Card.Title>
                  <Card.Text>{valor.descripcion}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="mb-5">
        <h2>Nuestro Equipo</h2>

        <Row xs={1} md={3} className="g-4">
          {equipoPasteleria.map(persona => (
            <Col key={persona.nombre}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title as="h3">{persona.nombre}</Card.Title>
                  <p className="fw-semibold">{persona.cargo}</p>
                  <Card.Text>{persona.descripcion}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      
      <section className="text-center">
        <h2>¿Quieres Conocernos?</h2>
        <p>Visítanos y descubre por qué somos los favoritos del barrio.</p>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button as={Link} to="/contacto" variant="primary">
            Contáctanos
          </Button>

          <Button as={Link} to="/productos" variant="outline-secondary">
            Ver Productos
          </Button>
        </div>
      </section>
    </>
  )
}

export default Nosotros