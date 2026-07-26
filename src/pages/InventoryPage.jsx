import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  producto_id: '',
  tipo_movimiento: 'ENTRADA',
  cantidad: '1',
  observacion: '',
}

function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [inventoryData, productsData] = await Promise.all([
        request('/inventario'),
        request('/productos'),
      ])
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
      setProducts(Array.isArray(productsData?.items) ? productsData.items : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await request('/inventario/movimientos', {
        method: 'POST',
        body: JSON.stringify({
          producto_id: Number(form.producto_id),
          tipo_movimiento: form.tipo_movimiento,
          cantidad: Number(form.cantidad),
          observacion: form.observacion,
        }),
      })
      setSuccess('Movimiento de inventario registrado')
      setForm(emptyForm)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalProducts = inventory.length
  const totalStock = inventory.reduce((acc, item) => acc + (Number(item.stock) || 0), 0)
  const lowStockCount = inventory.filter((item) => Number(item.stock) <= 10).length

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Inventario</h2>
          <p>Consulta de stock y registro de movimientos.</p>
        </div>
        <div className="panel-header-stats">
          <span className="stat-chip">Productos: <strong>{totalProducts}</strong></span>
          <span className="stat-chip">Stock total: <strong>{totalStock}</strong></span>
          {lowStockCount > 0 && (
            <span className="status-pill warn">Bajo stock: <strong>{lowStockCount}</strong></span>
          )}
        </div>
      </div>

      <div className="products-layout">
        <form className="form-card product-form" onSubmit={handleSubmit}>
          <h3>Registrar movimiento</h3>
          <p className="form-hint">Actualiza el inventario mediante entradas, salidas o salidas por venta.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="producto_id">Producto</label>
              <select id="producto_id" value={form.producto_id} onChange={(event) => setForm((current) => ({ ...current, producto_id: event.target.value }))} required>
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tipo_movimiento">Tipo</label>
              <select id="tipo_movimiento" value={form.tipo_movimiento} onChange={(event) => setForm((current) => ({ ...current, tipo_movimiento: event.target.value }))}>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
                <option value="SALIDA_VENTA">Salida por venta</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="cantidad">Cantidad</label>
              <input id="cantidad" name="cantidad" type="number" min="1" value={form.cantidad} onChange={(event) => setForm((current) => ({ ...current, cantidad: event.target.value }))} required />
            </div>
            <div className="field">
              <label htmlFor="observacion">Observación</label>
              <input id="observacion" name="observacion" value={form.observacion} onChange={(event) => setForm((current) => ({ ...current, observacion: event.target.value }))} />
            </div>
          </div>

          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar movimiento'}
          </button>
          {error && <div className="result-block">⚠️ {error}</div>}
          {success && <div className="result-block success">✅ {success}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Stock actual</strong>
            <span>{inventory.length} productos</span>
          </div>

          <div className="inventory-legend">
            <span className="inventory-legend-item inventory-legend-ok">Saludable (>10)</span>
            <span className="inventory-legend-item inventory-legend-warn">Bajo (≤10)</span>
            <span className="inventory-legend-item inventory-legend-danger">Crítico (≤0)</span>
          </div>

          {loading ? (
            <div className="inventory-loading">
              <span className="inventory-spinner" />
              <span>Cargando inventario...</span>
            </div>
          ) : inventory.length === 0 ? (
            <p className="empty">No hay productos en inventario.</p>
          ) : (
            <div className="product-table">
              <div className="product-row product-row-header">
                <span>Producto</span>
                <span>Categoría</span>
                <span>Stock</span>
                <span>Precio</span>
              </div>
              {inventory.map((item) => {
                const stock = Number(item.stock)
                const stockClass = stock <= 0 ? 'inventory-stock-danger' : stock <= 10 ? 'inventory-stock-warn' : 'inventory-stock-ok'
                return (
                  <div key={item.id} className="product-row inventory-row">
                    <span>{item.nombre}</span>
                    <span>{item.categoria}</span>
                    <span className={stockClass}>{stock}</span>
                    <span>${Number(item.precio).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default InventoryPage