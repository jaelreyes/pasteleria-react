// PESTAÑA 1 · Detalle de un blog: lee el id de la URL y muestra ese artículo.
import { Link, useParams } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import blogs from '../data/blogs'
import '../styles/Blogs.css'

// Detalle de un artículo del blog (/blogs/:id).
function BlogDetalle() {
  // useParams lee los parámetros de la ruta /blogs/:id. En /blogs/3, id vale "3" (texto).
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

  // Si lo encontró, se dibuja el artículo completo.
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

      {/* Partes opcionales: solo aparecen si el artículo las tiene */}
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