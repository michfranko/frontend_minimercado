const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function buildUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const rawBody = await response.text()
  let payload = null

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = rawBody
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.detail || 'No se pudo completar la solicitud'
    throw new Error(message)
  }

  return payload
}

export async function pingBackend() {
  return request('/')
}

export async function connectModule(endpoint) {
  return request(endpoint)
}

export default request
