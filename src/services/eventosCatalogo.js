export const EVENTO_CATALOGO = "pasteleria:catalogo-actualizado";

// Se avisa solo tras una respuesta exitosa, sin cambiar los contratos HTTP ni localStorage.
export function notificarCambioCatalogo() {
  window.dispatchEvent(new Event(EVENTO_CATALOGO));
}
