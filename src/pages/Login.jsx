import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { obtenerUsuarios } from '../data/db';

export default function Login({ onIniciarSesion }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const usuarios = obtenerUsuarios();
    const usuarioEncontrado = usuarios.find(
      u => (u.email === correo || u.correo === correo) && u.password === password
    );

    if (usuarioEncontrado) {
      onIniciarSesion(usuarioEncontrado);
      const tipo = (usuarioEncontrado.tipo || usuarioEncontrado.rol || '').toLowerCase();
      if (tipo === 'admin' || tipo === 'administrador' || tipo === 'vendedor') {
        navigate('/admin/ordenes');
      } else {
        navigate('/');
      }
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: '500px' }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: '#5c3d2e' }}>Iniciar sesión</h2>
        <p className="text-muted">Ingresa a tu cuenta de Pastelería 1000 Sabores.</p>
      </div>

      <Card className="shadow-sm border-0 p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="login-correo">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="tucorreo@ejemplo.com"
              value={correo} 
              onChange={(e) => setCorreo(e.target.value)}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="login-password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </Form.Group>

          <Button 
            type="submit" 
            className="w-100 py-2 fw-bold text-white mb-3"
            style={{ background: '#8b5a2b', border: 'none' }}
          >
            Iniciar sesión
          </Button>

          {/* Enlace para redirigir al registro de usuarios */}
          <div className="text-center mt-3">
            <span className="text-muted">¿No tienes una cuenta? </span>
            <Link to="/registro" className="fw-bold text-decoration-none" style={{ color: '#8b5a2b' }}>
              Regístrate aquí
            </Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}