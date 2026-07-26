import { useEffect, useState, useMemo } from 'react'
import request from '../services/api'

const emptyForm = {
  cliente_id: '',
  detalles: [{ producto_id: '', cantidad: 1 }],
}

const ITEMS_PER_PAGE = 10

function SalesPage() {
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [toast, setToast] = useState(null)
  const [expandedSaleId, setExpandedSaleId] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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
      showToast('Error al cargar datos: ' + err.message, 'error')
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

    try {
      const validDetails = form.detalles
        .filter((detail) => detail.producto_id && detail.cantidad > 0)

      if (validDetails.length === 0) {
        setError('Debe agregar al menos un producto válido')
        return
      }

      await request('/ventas', {
        method: 'POST',
        body: JSON.stringify({
          cliente_id: Number(form.cliente_id),
          detalles: validDetails.map((detail) => ({
            producto_id: Number(detail.producto_id),
            cantidad: Number(detail.cantidad),
          })),
        }),
      })
      showToast('Venta registrada correctamente')
      setForm({ ...emptyForm, detalles: [{ producto_id: '', cantidad: 1 }] })
      await loadData()
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getClientName = (clienteId) => {
    const client = clients.find((c) => c.id === clienteId)
    return client ? client.nombre : `#${clienteId}`
  }

  const getProductName = (productoId) => {
    const product = products.find((p) => p.id === productoId)
    return product ? product.nombre : `#${productoId}`
  }

  // Filtered sales based on search
  const filteredSales = useMemo(() => {
    let result = sales

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((sale) => {
        const clientName = getClientName(sale.cliente_id)?.toLowerCase() || ''
        return (
          clientName.includes(term) ||
          String(sale.id).includes(term) ||
          sale.total?.toString().includes(term)
        )
      })
    }

    return result
  }, [sales, search, clients])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage))
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredSales.slice(start, start + itemsPerPage)
  }, [filteredSales, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, itemsPerPage])

  const toggleExpandSale = (saleId) => {
    setExpandedSaleId((prev) => (prev === saleId ? null : saleId))
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

      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Ventas</h2>
          <p>Registro de ventas y visualización del historial.</p>
        </div>
        <div className="panel-header-stats">
          <span className="stat-chip">
            <strong>{sales.length}</strong> total
          </span>
          <span className="stat-chip">
            <strong>{filteredSales.length}</strong> filtrados
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="products-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por cliente, ID de venta o total..."
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

      <div className="sales-layout">
        {/* Columna izquierda: formulario */}
        <div className="sales-form-col">
          <form className="form-card product-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>Registrar venta</h3>
            </div>
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

              <div className="sales-details-section">
                <label className="sales-details-label">Productos de la venta</label>
                {form.detalles.map((detail, index) => (
                  <div key={index} className="sales-detail-row">
                    <div className="field sales-product-field">
                      <select value={detail.producto_id} onChange={(event) => handleDetailChange(index, 'producto_id', event.target.value)} required>
                        <option value="">Seleccione un producto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.nombre} — ${Number(product.precio).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field sales-qty-field">
                      <input type="number" min="1" value={detail.cantidad} onChange={(event) => handleDetailChange(index, 'cantidad', event.target.value)} required />
                    </div>
                    {form.detalles.length > 1 && (
                      <button type="button" className="button secondary sales-remove-btn" onClick={() => removeDetail(index)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="button secondary sales-add-btn" onClick={addDetail}>
                  + Agregar producto
                </button>
              </div>
            </div>

            <button className="button primary" type="submit" disabled={submitting} style={{ marginTop: 12, width: '100%' }}>
              {submitting ? 'Guardando...' : 'Guardar venta'}
            </button>
            {error && <div className="result-block">{error}</div>}
          </form>
        </div>

        {/* Columna derecha: historial */}
        <div className="sales-history-col">
          <div className="table-card product-list">
            <div className="table-header">
              <strong>Historial de ventas</strong>
              <span className="table-count">{filteredSales.length} registros</span>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p>Cargando ventas...</p>
              </div>
            ) : error && sales.length === 0 ? (
              <div className="error-state">
                <span className="error-icon">⚠️</span>
                <p>Error al cargar ventas</p>
                <button className="button secondary" onClick={loadData}>
                  Reintentar
                </button>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">{search ? '🔍' : '📊'}</span>
                <p>{search ? 'No se encontraron ventas con los filtros actuales.' : 'Aún no hay ventas registradas.'}</p>
                {search && (
                  <button className="button secondary" onClick={() => setSearch('')}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="sales-table">
                  <div className="sales-row sales-row-header">
                    <span className="sales-col-id">#</span>
                    <span className="sales-col-client">Cliente</span>
                    <span className="sales-col-total">Total</span>
                    <span className="sales-col-date">Fecha</span>
                    <span className="sales-col-actions">Acciones</span>
                  </div>
                  {paginatedSales.map((sale) => (
                    <div key={sale.id} className="sales-row">
                      <span className="sales-col-id">{sale.id}</span>
                      <span className="sales-col-client">{getClientName(sale.cliente_id)}</span>
                      <span className="sales-col-total sales-amount">${Number(sale.total || 0).toFixed(2)}</span>
                      <span className="sales-col-date sales-date">{new Date(sale.fecha).toLocaleDateString()}</span>
                      <span className="sales-col-actions">
                        <button
                          className="action-btn"
                          onClick={() => toggleExpandSale(sale.id)}
                          title="Ver detalle"
                          style={{ background: '#f1f5f9', borderRadius: 8, padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          {expandedSaleId === sale.id ? 'Ocultar' : 'Detalle'}
                        </button>
                      </span>
                    </div>
                  ))}
                  {expandedSaleId && (() => {
                    const sale = sales.find((s) => s.id === expandedSaleId)
                    if (!sale) return null
                    const subtotal = Number(sale.total || 0)
                    return (
                      <div className="sales-detail-expand">
                        <div className="sales-detail-items">
                          {(sale.detalles || []).map((detalle, idx) => (
                            <div key={idx} className="sales-detail-item">
                              <span className="sales-detail-name">{getProductName(detalle.producto_id)}</span>
                              <span className="sales-detail-qty">x{detalle.cantidad}</span>
                              <span className="sales-detail-price">${Number(detalle.precio_unitario || 0).toFixed(2)} c/u</span>
                              <span className="sales-detail-subtotal">${(Number(detalle.cantidad || 0) * Number(detalle.precio_unitario || 0)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="sales-detail-total">
                          <strong>Total:</strong> ${subtotal.toFixed(2)}
                        </div>
                      </div>
                    )
                  })()}
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
      </div>
    </section>
  )
}

export default SalesPage