import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  codigo_barras: '',
  nombre: '',
  categoria: '',
  costo: '',
  precio: '',
  stock: '0',
  activo: true,
}

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/productos')
      setProducts(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
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
      await request('/productos', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          costo: Number(form.costo),
          precio: Number(form.precio),
          stock: Number(form.stock),
        }),
      })
      setSuccess('Producto creado correctamente')
      setForm(emptyForm)
      await loadProducts()
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
          <h2>Productos</h2>
          <p>Gestión básica del catálogo y stock del minimercado.</p>
        </div>
      </div>

      <div className="products-layout">
        <form className="form-card product-form" onSubmit={handleSubmit}>
          <h3>Agregar producto</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="codigo_barras">Código de barras</label>
              <input id="codigo_barras" name="codigo_barras" value={form.codigo_barras} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="categoria">Categoría</label>
              <input id="categoria" name="categoria" value={form.categoria} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="costo">Costo</label>
              <input id="costo" name="costo" type="number" step="0.01" min="0" value={form.costo} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="precio">Precio</label>
              <input id="precio" name="precio" type="number" step="0.01" min="0" value={form.precio} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="stock">Stock</label>
              <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
              Producto activo
            </label>
          </div>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar producto'}
          </button>
          {error && <div className="result-block">{error}</div>}
          {success && <div className="result-block success">{success}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Listado de productos</strong>
            <span>{products.length} registros</span>
          </div>

          {loading ? (
            <p>Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="empty">Aún no hay productos registrados.</p>
          ) : (
            <div className="product-table">
              <div className="product-row product-row-header">
                <span>Nombre</span>
                <span>Categoría</span>
                <span>Precio</span>
                <span>Stock</span>
              </div>
              {products.map((product) => (
                <div key={product.id} className="product-row">
                  <span>{product.nombre}</span>
                  <span>{product.categoria}</span>
                  <span>${Number(product.precio).toFixed(2)}</span>
                  <span>{product.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProductsPage
