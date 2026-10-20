import { useState } from 'react';
import { obtenerOrdenes, actualizarEstadoOrden } from '../../data/db';
import { Table, Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';

export function OrdersAdmin() {
  const [ordenes, setOrdenes] = useState(() => obtenerOrdenes());
  const [filtroEstado, setFiltroEstado] = useState('');

  const cambiarEstado = (id, nuevoEstado) => {
    actualizarEstadoOrden(id, nuevoEstado);
    setOrdenes(obtenerOrdenes());
  };

  const obtenerColorBadge = (estado) => {
    switch (estado) {
      case 'completado': return 'success';
      case 'procesando': return 'warning';
      case 'cancelado': return 'danger';
      default: return 'secondary';
    }
  };

  const exportarCSV = () => {
    const ordenesActuales = obtenerOrdenes();
    if (ordenesActuales.length === 0) {
      alert('No hay órdenes para exportar.');
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,ID,Cliente,Correo,Total,Estado\n";
    ordenesActuales.forEach(o => {
      csvContent += `${o.id},"${o.nombre}","${o.email || o.correo}",${o.total},${o.estado}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_ordenes_pasteleria.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const ordenesActuales = obtenerOrdenes();
    const montoTotal = ordenesActuales.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    
    // Crear una ventana flotante limpia exclusiva para el reporte
    const ventanaPrint = window.open('', '', 'height=700,width=900');
    
    ventanaPrint.document.write('<html><head><title>Reporte de Órdenes - Pastelería 1000 Sabores</title>');
    ventanaPrint.document.write('<style>');
    ventanaPrint.document.write(`
      body { font-family: Arial, sans-serif; color: #333; padding: 20px; }
      h2 { color: #5c3d2e; border-bottom: 2px solid #5c3d2e; padding-bottom: 5px; }
      .summary { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
      th { background-color: #5c3d2e; color: white; }
      tr:nth-child(even) { background-color: #f9f9f9; }
    `);
    ventanaPrint.document.write('</style></head><body>');
    
    ventanaPrint.document.write('<h2>Reporte General de Órdenes - Pastelería 1000 Sabores</h2>');
    ventanaPrint.document.write(`<p><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString('es-CL')}</p>`);
    
    ventanaPrint.document.write('<div class="summary">');
    ventanaPrint.document.write(`<div><strong>Total Órdenes:</strong> ${ordenesActuales.length}</div>`);
    ventanaPrint.document.write(`<div><strong>Ventas Totales:</strong> $${montoTotal.toLocaleString('es-CL')}</div>`);
    ventanaPrint.document.write('</div>');
    
    ventanaPrint.document.write('<table>');
    ventanaPrint.document.write('<thead><tr><th>ID</th><th>Cliente</th><th>Correo</th><th>Dirección</th><th>Total</th><th>Estado</th></tr></thead>');
    ventanaPrint.document.write('<tbody>');
    
    if (ordenesActuales.length === 0) {
      ventanaPrint.document.write('<tr><td colspan="6" style="text-align: center;">No hay órdenes registradas.</td></tr>');
    } else {
      ordenesActuales.forEach(o => {
        ventanaPrint.document.write(`
          <tr>
            <td>${o.id}</td>
            <td>${o.nombre}</td>
            <td>${o.email || o.correo}</td>
            <td>${o.direccion || 'N/A'}</td>
            <td>$${Number(o.total || 0).toLocaleString('es-CL')}</td>
            <td>${o.estado || 'pendiente'}</td>
          </tr>
        `);
      });
    }
    
    ventanaPrint.document.write('</tbody></table>');
    ventanaPrint.document.write('</body></html>');
    
    ventanaPrint.document.close();
    ventanaPrint.focus();
    
    // Disparar la impresión automática para guardar como PDF limpio
    setTimeout(() => {
      ventanaPrint.print();
      ventanaPrint.close();
    }, 500);
  };

  // Filtrar órdenes por estado
  const ordenesFiltradas = ordenes.filter(o => {
    if (filtroEstado === '') return true;
    return (o.estado || '').toLowerCase() === filtroEstado.toLowerCase();
  });

  // Estadísticas (KPIs) de Órdenes
  const totalOrdenes = ordenes.length;
  const totalCompletadas = ordenes.filter(o => o.estado === 'completado').length;
  const totalPendientes = ordenes.filter(o => o.estado === 'pendiente' || !o.estado).length;
  const montoTotalVentas = ordenes.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  return (
    <Container className="my-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: '#5c3d2e', fontWeight: 'bold' }}>Gestión de Órdenes</h2>
          <p className="text-muted">Control de pedidos, estados de entrega y seguimiento de ventas.</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button 
            onClick={exportarCSV}
            style={{ background: '#28a745', border: 'none' }}
          >
            📥 Reporte CSV
          </Button>
          <Button 
            onClick={exportarPDF}
            style={{ background: '#dc3545', border: 'none' }}
          >
            🖨️ Exportar PDF
          </Button>
        </Col>
      </Row>

      {/* Tarjetas de Estadísticas (KPIs) */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Total Órdenes</h6>
            <h3 className="fw-bold mb-0" style={{ color: '#5c3d2e' }}>{totalOrdenes}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Completadas</h6>
            <h3 className="fw-bold mb-0 text-success">{totalCompletadas}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Pendientes</h6>
            <h3 className="fw-bold mb-0 text-warning">{totalPendientes}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-white text-center p-3">
            <h6 className="text-muted mb-1">Ventas Totales</h6>
            <h3 className="fw-bold mb-0 text-primary" style={{ fontSize: '1.4rem' }}>
              ${montoTotalVentas.toLocaleString('es-CL')}
            </h3>
          </Card>
        </Col>
      </Row>

      {/* Filtro de Estado */}
      <Card className="shadow-sm border-0 mb-4 p-3">
        <Row>
          <Col md={4}>
            <Form.Select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Filtrar por todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover striped className="mb-0 align-middle">
            <thead style={{ background: '#f8f9fa', color: '#5c3d2e' }}>
              <tr>
                <th className="py-3 px-4">ID Orden</th>
                <th className="py-3">Cliente / Correo</th>
                <th className="py-3">Dirección</th>
                <th className="py-3">Total</th>
                <th className="py-3">Estado</th>
                <th className="py-3 text-center">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <h5>No hay órdenes registradas.</h5>
                    <p className="mb-0 small">Realiza una compra de prueba desde el carrito para verla aquí.</p>
                  </td>
                </tr>
              ) : (
                ordenesFiltradas.map(o => (
                  <tr key={o.id}>
                    <td className="px-4 fw-bold text-primary">{o.id}</td>
                    <td>
                      <div><strong>{o.nombre}</strong></div>
                      <small className="text-muted">{o.email || o.correo}</small>
                    </td>
                    <td>
                      <small>{o.direccion} {o.comuna ? `(${o.comuna})` : ''}</small>
                    </td>
                    <td className="fw-bold text-success">${o.total?.toLocaleString('es-CL')}</td>
                    <td>
                      <Badge bg={obtenerColorBadge(o.estado)} className="text-uppercase px-2 py-1">
                        {o.estado || 'pendiente'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Form.Select 
                        size="sm" 
                        value={o.estado || 'pendiente'} 
                        onChange={(e) => cambiarEstado(o.id, e.target.value)}
                        className="w-75 mx-auto shadow-sm"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="bg-white text-muted small py-3 px-4">
          Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes en total.
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default OrdersAdmin;