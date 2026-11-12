// Pruebas de la sesión en el frontend: lectura del JWT y envío del token en cada petición.
import {
  tokenExpirado,
  haySesionValida,
  guardarSesion,
  limpiarSesion,
} from '../services/sesion'
import api from '../services/api'

// Crea un JWT de prueba con la fecha de expiración indicada (en segundos).
function crearToken(expSegundos) {
  const base64Url = texto =>
    btoa(JSON.stringify(texto))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  return `${base64Url({ alg: 'HS256' })}.${base64Url({
    sub: 'admin@duoc.cl',
    exp: expSegundos,
  })}.firma`
}

const enUnaHora = () => Math.floor(Date.now() / 1000) + 3600
const haceUnaHora = () => Math.floor(Date.now() / 1000) - 3600

describe('Sesión (services/sesion.js y api.js)', () => {
  let almacenamiento

  beforeEach(() => {
    almacenamiento = {}

    spyOn(Storage.prototype, 'getItem').and.callFake(clave =>
      Object.prototype.hasOwnProperty.call(almacenamiento, clave)
        ? almacenamiento[clave]
        : null
    )
    spyOn(Storage.prototype, 'setItem').and.callFake((clave, valor) => {
      almacenamiento[clave] = String(valor)
    })
    spyOn(Storage.prototype, 'removeItem').and.callFake(clave => {
      delete almacenamiento[clave]
    })
  })

  it('detecta un token vigente y uno expirado', () => {
    expect(tokenExpirado(crearToken(enUnaHora()))).toBe(false)
    expect(tokenExpirado(crearToken(haceUnaHora()))).toBe(true)
  })

  it('considera expirado un token mal formado', () => {
    expect(tokenExpirado('esto-no-es-un-jwt')).toBe(true)
  })

  it('mantiene la sesión mientras el refresh token esté vigente', () => {
    guardarSesion({
      token: crearToken(haceUnaHora()),
      refreshToken: crearToken(enUnaHora()),
      usuario: { nombre: 'Ana' },
    })

    expect(haySesionValida()).toBe(true)
  })

  it('no hay sesión si el refresh token venció', () => {
    guardarSesion({ refreshToken: crearToken(haceUnaHora()) })

    expect(haySesionValida()).toBe(false)
  })

  it('al cerrar sesión borra token, refreshToken y usuario', () => {
    guardarSesion({
      token: 'a',
      refreshToken: 'b',
      usuario: { nombre: 'Ana' },
    })

    limpiarSesion()

    expect(almacenamiento).toEqual({})
  })

  it('api.js agrega el token en el header Authorization', async () => {
    almacenamiento.token = 'mi-token'

    // Adaptador falso: devuelve la configuración que axios habría enviado.
    const respuesta = await api.get('/auth/me', {
      adapter: config =>
        Promise.resolve({ data: config.headers, status: 200, config, headers: {} }),
    })

    expect(respuesta.data.Authorization).toBe('Bearer mi-token')
  })
})