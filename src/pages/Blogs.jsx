import { Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import blogs from '../data/blogs'
import '../styles/Blogs.css'

function Blogs() {
  return (
    <section className="blogs">
      <div className="blogs-hero">
        <h1>Nuestro Blog</h1>
        <p>Recetas, consejos y todo sobre el mundo de la repostería</p>
      </div>

      <Row xs={1} md={2} className="g-4">
        {blogs.map(blog => (
          <Col key={blog.id}>
            <Card className="blog-card h-100">
              <Card.Img
                variant="top"
                src={blog.imagen}
                alt={blog.titulo}
                loading="lazy"
              />

              <Card.Body className="d-flex flex-column">
                <span className="blog-categoria">{blog.categoria}</span>

                <Card.Title as="h2" className="blog-card-titulo">
                  {blog.titulo}
                </Card.Title>

                <Card.Text>{blog.resumen}</Card.Text>

                <p className="blog-meta">
                  {blog.fecha} · {blog.autor}
                </p>

                <Button
                  as={Link}
                  to={`/blogs/${blog.id}`}
                  className="blog-btn mt-auto align-self-start"
                >
                  Leer más →
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default Blogs