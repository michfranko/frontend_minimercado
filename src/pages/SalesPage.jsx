import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  cliente_id: '',
  detalles: [{ producto_id: '', cantidad: 1 }],
}

function SalesPage() {
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [clientsData, productsData, salesData] = await Promise.all([
        request('/clientes'),
        request('/productos'),
        request('/ventas'),
      ])
      setClients(Array.isArray(clientsData?.items) ? clientsData.items : [])
      setProducts(Array.isArray(productsData?.items) ? productsData.items : [])
      setSales(Array.isArray(salesData?.items) ? salesData.items : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelectChange = (event) => {
    setForm((current) => ({ ...current, cliente_id: event.target.value }))
  }

  const handleDetailChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: field === 'cantidad' ? Number(value) : value } : detail,
      ),
    }))
  }

  const addDetail = () => {
    setForm((current) => ({
      ...current,
      detalles: [...current.detalles, { producto_id: '', cantidad: 1 }],
    }))
  }

  const removeDetail = (index) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.filter((_, detailIndex) => detailIndex !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await request('/ventas', {
        method: 'POST',
        body: JSON.stringify({
          cliente_id: Number(form.cliente_id),
          detalles: form.detalles
            .filter((detail) => detail.producto_id)
            .map((detail) => ({
              producto_id: Number(detail.producto_id),
              cantidad: Number(detail.cantidad),
            })),
        }),
      })
      setSuccess('Venta registrada correctamente')
      setForm(emptyForm)
      await loadData()
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
          <h2>Ventas</h2>
          <p>Registro rápido de ventas y visualización del historial.</p>
        </div>
      </div>

      <div className="products-layout">
        <form className="form-card product-form" onSubmit={handleSubmit}>
          <h3>Registrar venta</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="cliente_id">Cliente</label>
              <select id="cliente_id" value={form.cliente_id} onChange={handleSelectChange} required>
                <option value="">Seleccione un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombre}
                  </option>
                ))}
              </select>
            </div>

            {form.detalles.map((detail, index) => (
              <div key={index} className="detail-row">
                <div className="field">
                  <label>Producto</label>
                  <select value={detail.producto_id} onChange={(event) => handleDetailChange(index, 'producto_id', event.target.value)} required>
                    <option value="">Seleccione un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Cantidad</label>
                  <input type="number" min="1" value={detail.cantidad} onChange={(event) => handleDetailChange(index, 'cantidad', event.target.value)} required />
                </div>
                {form.detalles.length > 1 && (
                  <button type="button" className="button secondary" onClick={() => removeDetail(index)}>
                    Quitar
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="button secondary" onClick={addDetail}>
              + Agregar producto
            </button>
          </div>

          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar venta'}
          </button>
          {error && <div className="result-block">{error}</div>}
          {success && <div className="result-block success">{success}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Historial de ventas</strong>
            <span>{sales.length} registros</span>
          </div>

          {loading ? (
            <p>Cargando ventas...</p>
          ) : sales.length === 0 ? (
            <p className="empty">No hay ventas registradas aún.</p>
          ) : (
            <div className="product-table">
              <div className="product-row product-row-header">
                <span>ID</span>
                <span>Cliente</span>
                <span>Total</span>
                <span>Fecha</span>
              </div>
              {sales.map((sale) => (
                <div key={sale.id} className="product-row">
                  <span>#{sale.id}</span>
                  <span>{sale.cliente_id}</span>
                  <span>${Number(sale.total || 0).toFixed(2)}</span>
                  <span>{new Date(sale.fecha).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SalesPage
