import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  cedula: '',
  nombre: '',
  telefono: '',
  correo: '',
  activo: true,
}

function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadClients = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/clientes')
      setClients(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await request('/clientes', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess('Cliente registrado correctamente')
      setForm(emptyForm)
      await loadClients()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Clientes</h2>
          <p>Registro básico de clientes para el negocio.</p>
        </div>
      </div>

      <div className="products-layout">
        <form className="form-card product-form" onSubmit={handleSubmit}>
          <h3>Agregar cliente</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="cedula">Cédula</label>
              <input id="cedula" name="cedula" value={form.cedula} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="correo">Correo</label>
              <input id="correo" name="correo" type="email" value={form.correo} onChange={handleChange} required />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
              Cliente activo
            </label>
          </div>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cliente'}
          </button>
          {error && <div className="result-block">{error}</div>}
          {success && <div className="result-block success">{success}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Listado de clientes</strong>
            <span>{clients.length} registros</span>
          </div>

          {loading ? (
            <p>Cargando clientes...</p>
          ) : clients.length === 0 ? (
            <p className="empty">No hay clientes registrados todavía.</p>
          ) : (
            <div className="product-table">
              <div className="product-row product-row-header">
                <span>Nombre</span>
                <span>Cédula</span>
                <span>Teléfono</span>
                <span>Correo</span>
              </div>
              {clients.map((client) => (
                <div key={client.id} className="product-row">
                  <span>{client.nombre}</span>
                  <span>{client.cedula}</span>
                  <span>{client.telefono}</span>
                  <span>{client.correo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ClientsPage
