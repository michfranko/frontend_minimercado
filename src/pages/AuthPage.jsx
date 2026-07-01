import { useState } from 'react'
import request from '../services/api'

function AuthPage() {
  const [form, setForm] = useState({ username_or_email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess(true)
      setMessage(`Sesión iniciada. Token recibido: ${data.access_token.slice(0, 20)}...`)
    } catch (error) {
      setSuccess(false)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Autenticación</p>
          <h2>Inicio de sesión</h2>
          <p>Formulario base para probar el login del backend.</p>
        </div>
      </div>

      <div className="form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username_or_email">Usuario o correo</label>
            <input
              id="username_or_email"
              name="username_or_email"
              value={form.username_or_email}
              onChange={handleChange}
              placeholder="admin o admin@minimercado.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Admin12345"
            />
          </div>

          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {message && (
          <div className={`result-block ${success ? 'success' : ''}`}>{message}</div>
        )}
      </div>
    </section>
  )
}

export default AuthPage
