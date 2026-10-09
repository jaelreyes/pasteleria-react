import { Link } from 'react-router-dom'

function Home() {
  return (
    <section>
      <h2>Bienvenidos a Pastelería 1000 Sabores</h2>
      <p>
        Encuentra tortas y dulces para compartir en cada ocasión.
      </p>

      <Link to="/productos">Explorar productos</Link>
    </section>
  )
}

export default Home