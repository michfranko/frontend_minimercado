import { useEffect, useState, useMemo } from 'react'
import request from '../services/api'

const emptyForm = {
  ruc: '',
  nombre: '',
  telefono: '',
  correo: '',
  activo: true,
  producto_ids: [],
}

const ITEMS_PER_PAGE = 10

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [productSearch, setProductSearch] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadProveedores = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/proveedores')
      setProveedores(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
      showToast('Error al cargar proveedores: ' + err.message, 'error')
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

  // Filtered providers based on search
  const filteredProveedores = useMemo(() => {
    let result = proveedores

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(term) ||
          p.ruc?.toLowerCase().includes(term) ||
          p.telefono?.toLowerCase().includes(term) ||
          p.correo?.toLowerCase().includes(term)
      )
    }

    return result
  }, [proveedores, search])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProveedores.length / itemsPerPage))
  const paginatedProveedores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProveedores.slice(start, start + itemsPerPage)
  }, [filteredProveedores, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, itemsPerPage])

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
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = { ...form }
      if (editingId) {
        await request(`/proveedores/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        showToast('Proveedor actualizado correctamente')
      } else {
        await request('/proveedores', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        showToast('Proveedor registrado correctamente')
      }
      resetForm()
      await loadProveedores()
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (proveedor) => {
    setEditingId(proveedor.id)
    setForm({
      ruc: proveedor.ruc || '',
      nombre: proveedor.nombre || '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      activo: proveedor.activo !== false,
      producto_ids: proveedor.producto_ids || [],
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = (proveedor) => {
    setDeleteConfirm(proveedor)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await request(`/proveedores/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      showToast(`Proveedor "${deleteConfirm.nombre}" desactivado`)
      setDeleteConfirm(null)
      await loadProveedores()
    } catch (err) {
      showToast('Error al eliminar: ' + err.message, 'error')
      setDeleteConfirm(null)
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
    try {
      await request(`/proveedores/${selectedProvider.id}/productos`, {
        method: 'PUT',
        body: JSON.stringify({ producto_ids: selectedProductIds }),
      })
      showToast(`Productos asignados a ${selectedProvider.nombre}`)
      setShowProductModal(false)
      setSelectedProvider(null)
      await loadProveedores()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const filteredProducts = useMemo(() => {
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.categoria.toLowerCase().includes(productSearch.toLowerCase())
    )
  }, [productos, productSearch])

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
      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar desactivación</h3>
            <p>
              ¿Estás seguro de desactivar al proveedor <strong>"{deleteConfirm.nombre}"</strong>?
            </p>
            <p className="modal-warning">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="button danger" onClick={handleDelete}>
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Proveedores</h2>
          <p>Gestión de proveedores y alineación con los productos que proveen.</p>
        </div>
        <div className="panel-header-stats">
          <span className="stat-chip">
            <strong>{proveedores.length}</strong> total
          </span>
          <span className="stat-chip">
            <strong>{filteredProveedores.length}</strong> filtrados
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="products-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, RUC, teléfono o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>
        <div className="filter-group">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="filter-select"
          >
            <option value={10}>10 / pág</option>
            <option value={20}>20 / pág</option>
            <option value={50}>50 / pág</option>
          </select>
        </div>
      </div>

      <div className="products-layout">
        <form className="form-card product-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>{editingId ? 'Editar proveedor' : 'Agregar proveedor'}</h3>
            {editingId && (
              <button type="button" className="button secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="ruc">RUC</label>
              <input
                id="ruc"
                name="ruc"
                value={form.ruc}
                onChange={handleChange}
                maxLength={13}
                required
                placeholder="Número de RUC"
              />
            </div>
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre o razón social"
              />
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                required
                placeholder="Número de teléfono"
              />
            </div>
            <div className="field">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                required
                placeholder="correo@proveedor.com"
              />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
              Proveedor activo
            </label>
          </div>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : editingId
                ? 'Actualizar proveedor'
                : 'Guardar proveedor'}
          </button>
          {error && <div className="result-block">{error}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Listado de proveedores</strong>
            <span className="table-count">{filteredProveedores.length} registros</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Cargando proveedores...</p>
            </div>
          ) : error && proveedores.length === 0 ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>Error al cargar proveedores</p>
              <button className="button secondary" onClick={loadProveedores}>
                Reintentar
              </button>
            </div>
          ) : filteredProveedores.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                {search ? '🔍' : '🏢'}
              </span>
              <p>
                {search
                  ? 'No se encontraron proveedores con los filtros actuales.'
                  : 'Aún no hay proveedores registrados.'}
              </p>
              {search && (
                <button
                  className="button secondary"
                  onClick={() => setSearch('')}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="product-table">
                <div className="product-row product-row-header">
                  <span className="col-name">Nombre</span>
                  <span className="col-category">RUC</span>
                  <span className="col-price">Teléfono</span>
                  <span className="col-stock">Productos</span>
                  <span className="col-status">Estado</span>
                  <span className="col-actions">Acciones</span>
                </div>
                {paginatedProveedores.map((prov) => {
                  const productNames = getProductNames(prov.producto_ids || [])
                  return (
                    <div key={prov.id} className="product-row">
                      <span className="col-name">
                        <span className="product-name">{prov.nombre}</span>
                      </span>
                      <span className="col-category">
                        <span className="category-tag">{prov.ruc}</span>
                      </span>
                      <span className="col-price">{prov.telefono}</span>
                      <span className="col-stock">
                        <button
                          className="action-btn"
                          style={{ fontSize: '0.82rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: 8 }}
                          onClick={() => openProductModal(prov)}
                          title="Asignar productos"
                        >
                          📦 {prov.producto_ids?.length || 0} prod.
                        </button>
                        {productNames.length > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                            {productNames.slice(0, 2).join(', ')}
                            {productNames.length > 2 && ` +${productNames.length - 2}`}
                          </span>
                        )}
                      </span>
                      <span className="col-status">
                        <span className={`status-badge ${prov.activo ? 'status-active' : 'status-inactive'}`}>
                          {prov.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </span>
                      <span className="col-actions">
                        <button
                          className="action-btn action-edit"
                          onClick={() => openEdit(prov)}
                          title="Editar proveedor"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => confirmDelete(prov)}
                          title="Desactivar proveedor"
                        >
                          🗑️
                        </button>
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Anterior
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true
                        if (page === 1 || page === totalPages) return true
                        if (Math.abs(page - currentPage) <= 1) return true
                        return false
                      })
                      .map((page, index, arr) => {
                        const showEllipsis = index > 0 && page - arr[index - 1] > 1
                        return (
                          <span key={page} className="pagination-page-group">
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                            <button
                              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </span>
                        )
                      })}
                  </div>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de asignación de productos */}
      {showProductModal && selectedProvider && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Productos proveídos por {selectedProvider.nombre}</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 12 }}>
              Selecciona los productos que este proveedor suministra.
            </p>

            <div className="search-box" style={{ marginBottom: 12 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="search-input"
              />
              {productSearch && (
                <button className="search-clear" onClick={() => setProductSearch('')}>
                  ✕
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320 }}>
              {filteredProducts.length === 0 && (
                <div className="empty-state" style={{ padding: 20 }}>
                  <span className="empty-icon">📦</span>
                  <p>No hay productos disponibles.</p>
                </div>
              )}
              {filteredProducts.map((p) => (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
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
                  <span style={{ fontWeight: 600, flex: 1, fontSize: '0.9rem' }}>{p.nombre}</span>
                  <span className="category-tag">{p.categoria}</span>
                </label>
              ))}
            </div>

            <div className="modal-actions">
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