const dominiosPermitidos = [
  'duoc.cl',
  'profesor.duoc.cl',
  'duocuc.cl',
  'gmail.com',
]

// Quita puntos, guiones y espacios para comparar los RUN.
export function normalizarRun(run) {
  return run.replace(/[.\-\s]/g, '').toUpperCase()
}

// Calcula el dígito verificador con el algoritmo módulo 11.
function calcularDV(cuerpo) {
  let suma = 0
  let multiplicador = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resultado = 11 - (suma % 11)

  if (resultado === 11) return '0'
  if (resultado === 10) return 'K'

  return String(resultado)
}

export function validarRun(run) {
  const limpio = normalizarRun(run)

  if (limpio.length < 7 || limpio.length > 9) return false

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  if (!/^\d+$/.test(cuerpo)) return false
  if (!/^[0-9K]$/.test(dv)) return false

  return dv === calcularDV(cuerpo)
}

export function validarCorreo(correo) {
  const limpio = correo.trim().toLowerCase()
  const formato = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (limpio.length > 100 || !formato.test(limpio)) {
    return false
  }

  const dominio = limpio.split('@')[1]
  return dominiosPermitidos.includes(dominio)
}

export function validarPassword(password) {
  const largo = password.trim().length
  return largo >= 4 && largo <= 10
}

export function validarTelefono(telefono) {
  const limpio = telefono.trim()

  // El teléfono es opcional.
  if (limpio === '') return true

  if (limpio.length > 20 || !/^[\d\s+()-]+$/.test(limpio)) {
    return false
  }

  const digitos = limpio.replace(/\D/g, '')
  return digitos.length >= 8 && digitos.length <= 15
}

export function calcularEdad(fechaTexto) {
  const nacimiento = new Date(`${fechaTexto}T00:00:00`)
  const hoy = new Date()

  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const diferenciaMes = hoy.getMonth() - nacimiento.getMonth()

  if (
    diferenciaMes < 0 ||
    (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--
  }

  return edad
}