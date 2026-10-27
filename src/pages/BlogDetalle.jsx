import { Link, useParams } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import blogs from '../data/blogs'
import '../styles/Blogs.css'

// Detalle de un artículo del blog (/blogs/:id).
function BlogDetalle() {
  const { id } = useParams()

  // El id de la URL es texto, por eso se convierte a número.
  const blog = blogs.find(blog => blog.id === Number(id))

  // Si el id no existe, se muestra un aviso.
  if (!blog) {
    return (
      <section>
        <Alert variant="warning">Artículo no encontrado.</Alert>
        <Link to="/blogs">Volver al blog</Link>
      </section>
    )
  }

  return (
    <article className="blog-detalle">
      <Link to="/blogs" className="blog-volver">
        ← Volver al Blog
      </Link>

      <header className="blog-detalle-header">
        <span className="blog-categoria">{blog.categoria}</span>
        <h1>{blog.titulo}</h1>
        <p className="blog-meta">
          {blog.fecha} · {blog.autor} · {blog.lectura}
        </p>
      </header>

      <img
        src={blog.imagen}
        alt={blog.titulo}
        className="blog-detalle-imagen"
      />

      <p className="blog-intro">{blog.intro}</p>

      {/* Secciones del artículo */}
      {blog.secciones.map(seccion => (
        <section key={seccion.titulo}>
          <h2>{seccion.titulo}</h2>
          <p>{seccion.texto}</p>
        </section>
      ))}

      {blog.lista && (
        <section>
          <h2>{blog.lista.titulo}</h2>
          <ul>
            {blog.lista.items.map(item => (
              <li key={item.nombre}>
                <strong>{item.nombre}:</strong> {item.texto}
              </li>
            ))}
          </ul>
        </section>
      )}

      {blog.cita && <blockquote className="blog-cita">{blog.cita}</blockquote>}

      {blog.cierre && <p className="blog-cierre">{blog.cierre}</p>}

      <Link to="/blogs" className="blog-volver">
        ← Ver más artículos
      </Link>
    </article>
  )
}

export default BlogDetalle