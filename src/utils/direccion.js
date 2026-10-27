// Formato de la dirección de despacho (checkout y boleta).
// Une calle, departamento, comuna y región en una sola línea.
// Ej: "Los Crisantemos 45, Depto 603, Cerrillos, Metropolitana de Santiago"
export function armarDireccion({ direccion, departamento, comuna, region }) {
  return [direccion, departamento, comuna, region]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean)
    .join(", ")
}