import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  ruc: '',
  nombre: '',
  telefono: '',
  correo: '',
  activo: true,
  producto_ids: [],
}

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [productSearch, setProductSearch] = useState('')

  const loadProveedores = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/proveedores')
      setProveedores(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadProductos = async () => {
    try {
      const data = await request('/productos')
      setProductos(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      console.error('Error cargando productos:', err)
    }
  }

  useEffect(() => {
    loadProveedores()
    loadProductos()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = { ...form }
      if (editingId) {
        await request(`/proveedores/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setSuccess('Proveedor actualizado correctamente')
      } else {
        await request('/proveedores', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setSuccess('Proveedor registrado correctamente')
      }
      resetForm()
      await loadProveedores()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (proveedor) => {
    setForm({
      ruc: proveedor.ruc,
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      activo: proveedor.activo,
      producto_ids: proveedor.producto_ids || [],
    })
    setEditingId(proveedor.id)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este proveedor?')) return
    setError('')
    setSuccess('')
    try {
      await request(`/proveedores/${id}`, { method: 'DELETE' })
      setSuccess('Proveedor desactivado correctamente')
      await loadProveedores()
    } catch (err) {
      setError(err.message)
    }
  }

  const openProductModal = (proveedor) => {
    setSelectedProvider(proveedor)
    setSelectedProductIds(proveedor.producto_ids || [])
    setShowProductModal(true)
    setProductSearch('')
  }

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSaveProducts = async () => {
    if (!selectedProvider) return
    setError('')
    setSuccess('')
    try {
      await request(`/proveedores/${selectedProvider.id}/productos`, {
        method: 'PUT',
        body: JSON.stringify({ producto_ids: selectedProductIds }),
      })
      setSuccess(`Productos asignados a ${selectedProvider.nombre}`)
      setShowProductModal(false)
      setSelectedProvider(null)
      await loadProveedores()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredProducts = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.categoria.toLowerCase().includes(productSearch.toLowerCase())
  )

  const getProductNames = (productoIds) => {
    return productoIds
      .map((id) => {
        const p = productos.find((prod) => prod.id === id)
        return p ? p.nombre : null
      })
      .filter(Boolean)
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Proveedores</h2>
          <p>Gestión de proveedores y alineación con los productos que proveen.</p>
        </div>
      </div>

      <div className="products-layout">
        <form className="form-card product-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Editar proveedor' : 'Agregar proveedor'}</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="ruc">RUC</label>
              <input id="ruc" name="ruc" value={form.ruc} onChange={handleChange} maxLength={13} required />
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
              Proveedor activo
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar proveedor'}
            </button>
            {editingId && (
              <button className="button secondary" type="button" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
          {error && <div className="result-block">{error}</div>}
          {success && <div className="result-block success">{success}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Listado de proveedores</strong>
            <span>{proveedores.length} registros</span>
          </div>

          {loading ? (
            <p>Cargando proveedores...</p>
          ) : proveedores.length === 0 ? (
            <p className="empty">No hay proveedores registrados todavía.</p>
          ) : (
            <div className="product-table">
              <div className="product-row product-row-header" style={{ gridTemplateColumns: '1.6fr 1.2fr 1.2fr 1fr 80px 50px' }}>
                <span>Nombre</span>
                <span>RUC</span>
                <span>Teléfono</span>
                <span>Productos</span>
                <span>Acción</span>
              </div>
              {proveedores.map((prov) => {
                const productNames = getProductNames(prov.producto_ids || [])
                return (
                  <div key={prov.id} className="product-row" style={{ gridTemplateColumns: '1.6fr 1.2fr 1.2fr 1fr 80px 50px' }}>
                    <span>{prov.nombre}</span>
                    <span>{prov.ruc}</span>
                    <span>{prov.telefono}</span>
                    <span>
                      <button
                        className="button secondary"
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                        onClick={() => openProductModal(prov)}
                        title="Asignar productos"
                      >
                        {prov.producto_ids?.length || 0} prod.
                      </button>
                    </span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      <button className="button secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => handleEdit(prov)}>
                        Editar
                      </button>
                      <button
                        className="button secondary"
                        style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#b42318' }}
                        onClick={() => handleDelete(prov.id)}
                      >
                        Elim.
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de asignación de productos */}
      {showProductModal && selectedProvider && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => setShowProductModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 18,
              padding: 24,
              width: 480,
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Productos proveídos por {selectedProvider.nombre}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 12 }}>
              Selecciona los productos que este proveedor suministra.
            </p>

            <input
              type="text"
              placeholder="Buscar productos..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 12,
                font: 'inherit',
              }}
            />

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredProducts.length === 0 && <p className="empty">No hay productos disponibles.</p>}
              {filteredProducts.map((p) => (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #e8edf7',
                    cursor: 'pointer',
                    background: selectedProductIds.includes(p.id) ? '#eef2ff' : '#fff',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleProductSelection(p.id)}
                  />
                  <span style={{ fontWeight: 600, flex: 1 }}>{p.nombre}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.categoria}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button className="button secondary" onClick={() => setShowProductModal(false)}>
                Cancelar
              </button>
              <button className="button primary" onClick={handleSaveProducts}>
                Guardar asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProveedoresPage