import { useState } from 'react'
import request from '../services/api'

function AuthPage() {
  const [form, setForm] = useState({ username_or_email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <section className="panel auth-panel">
      <div className="auth-layout">
        {/* Left side — Branding Hero */}
        <div className="auth-brand">
          <div className="auth-brand-bg" />
          <div className="auth-brand-content">
            <div className="auth-brand-badge">
              <span className="auth-brand-dot" />
              Seguridad
            </div>
            <h2 className="auth-brand-title">Acceso al sistema</h2>
            <p className="auth-brand-desc">
              Inicia sesión para acceder al panel de administración y gestión del minimercado.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">📊</span>
                <div>
                  <strong>Panel de control</strong>
                  <small>Métricas y dashboard en tiempo real</small>
                </div>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">🔐</span>
                <div>
                  <strong>Acceso seguro</strong>
                  <small>Autenticación con JWT tokens</small>
                </div>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">⚡</span>
                <div>
                  <strong>Gestión rápida</strong>
                  <small>Productos, ventas y más</small>
                </div>
              </div>
            </div>

            <div className="auth-brand-footer">
              <span className="auth-brand-footer-shield">🛡️</span>
              <span>Minimercado UPS v1.0</span>
            </div>
          </div>
        </div>

        {/* Right side — Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h3 className="auth-form-title">Inicio de sesión</h3>
            <p className="auth-form-subtitle">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="username_or_email" className="auth-label">
                <span className="auth-label-icon">👤</span>
                Usuario o correo
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="username_or_email"
                  name="username_or_email"
                  type="text"
                  value={form.username_or_email}
                  onChange={handleChange}
                  placeholder="admin@minimercado.com"
                  autoComplete="username"
                  className="auth-input"
                />
                <span className="auth-input-icon">📧</span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                <span className="auth-label-icon">🔑</span>
                Contraseña
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  Ingresando…
                </span>
              ) : (
                <span className="auth-btn-text">
                  Ingresar
                  <span className="auth-btn-arrow">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Message block */}
          {message && (
            <div className={`auth-result ${success ? 'auth-result-success' : 'auth-result-error'}`}>
              <span className="auth-result-icon">
                {success ? '✅' : '❌'}
              </span>
              <div className="auth-result-body">
                <strong>{success ? 'Conexión exitosa' : 'Error de autenticación'}</strong>
                <span>{message}</span>
              </div>
            </div>
          )}

          <div className="auth-form-footer">
            <p>¿Problemas para acceder? Contacta al administrador del sistema.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthPage