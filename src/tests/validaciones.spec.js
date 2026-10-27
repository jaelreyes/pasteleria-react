// Pruebas de las validaciones: RUN, correo, contraseña y edad.
import {
  validarRun,
  validarCorreo,
  validarPassword,
  validarTelefono,
} from '../utils/validaciones'

describe('Validaciones del formulario', () => {
  it('acepta un RUN válido con o sin puntos y guion', () => {
    expect(validarRun('19.011.022-2')).toBe(true)
    expect(validarRun('190110222')).toBe(true)
  })

  it('rechaza un RUN con dígito verificador incorrecto', () => {
    expect(validarRun('19.011.022-5')).toBe(false)
  })

  it('solo acepta correos de los dominios permitidos', () => {
    expect(validarCorreo('ana@duoc.cl')).toBe(true)
    expect(validarCorreo('ana@gmail.com')).toBe(true)
    expect(validarCorreo('ana@hotmail.com')).toBe(false)
    expect(validarCorreo('ana.duoc.cl')).toBe(false)
  })

  it('exige una contraseña de 4 a 10 caracteres', () => {
    expect(validarPassword('abc')).toBe(false)
    expect(validarPassword('abcd')).toBe(true)
    expect(validarPassword('12345678901')).toBe(false)
  })

  it('permite el teléfono vacío pero no uno con letras', () => {
    expect(validarTelefono('')).toBe(true)
    expect(validarTelefono('+56 9 1234 5678')).toBe(true)
    expect(validarTelefono('fono123')).toBe(false)
  })
})