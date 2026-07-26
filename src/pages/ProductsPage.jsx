import { useEffect, useState, useMemo } from 'react'
import request from '../services/api'

const CATEGORIES = [
  'Alimentos',
  'Bebidas',
  'Limpieza',
  'Higiene',
  'Lácteos',
  'Carnes',
  'Frutas y Verduras',
  'Panadería',
  'Congelados',
  'Otros',
]

const emptyForm = {
  codigo_barras: '',
  nombre: '',
  categoria: '',
  costo: '',
  precio: '',
  stock: '0',
  activo: true,
}

const ITEMS_PER_PAGE = 10

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/productos')
      setProducts(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
      showToast('Error al cargar productos: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Filtered products based on search and category
  const filteredProducts = useMemo(() => {
    let result = products

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(term) ||
          p.codigo_barras?.toLowerCase().includes(term) ||
          p.categoria?.toLowerCase().includes(term)
      )
    }

    if (categoryFilter) {
      result = result.filter((p) => p.categoria === categoryFilter)
    }

    return result
  }, [products, search, categoryFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, itemsPerPage])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setForm({
      codigo_barras: product.codigo_barras || '',
      nombre: product.nombre || '',
      categoria: product.categoria || '',
      costo: product.costo?.toString() || '',
      precio: product.precio?.toString() || '',
      stock: product.stock?.toString() || '0',
      activo: product.activo !== false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      ...form,
      costo: Number(form.costo),
      precio: Number(form.precio),
      stock: Number(form.stock),
    }

    try {
      if (editingId) {
        await request(`/productos/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        showToast('Producto actualizado correctamente')
      } else {
        await request('/productos', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        showToast('Producto creado correctamente')
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadProducts()
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (product) => {
    setDeleteConfirm(product)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await request(`/productos/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      showToast(`Producto "${deleteConfirm.nombre}" eliminado`)
      setDeleteConfirm(null)
      await loadProducts()
    } catch (err) {
      showToast('Error al eliminar: ' + err.message, 'error')
      setDeleteConfirm(null)
    }
  }

  const getStockStatus = (stock) => {
    const qty = Number(stock)
    if (qty <= 0) return { label: 'Sin stock', className: 'stock-badge stock-none' }
    if (qty <= 5) return { label: 'Stock bajo', className: 'stock-badge stock-low' }
    if (qty <= 15) return { label: 'Stock medio', className: 'stock-badge stock-medium' }
    return { label: 'Stock alto', className: 'stock-badge stock-high' }
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
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro de eliminar el producto <strong>"{deleteConfirm.nombre}"</strong>?
            </p>
            <p className="modal-warning">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="button danger" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Productos</h2>
          <p>Gestión del catálogo y stock del minimercado.</p>
        </div>
        <div className="panel-header-stats">
          <span className="stat-chip">
            <strong>{products.length}</strong> total
          </span>
          <span className="stat-chip">
            <strong>{filteredProducts.length}</strong> filtrados
          </span>
        </div>
      </div>

      {/* Search and filters bar */}
      <div className="products-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, código o categoría..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
            <h3>{editingId ? 'Editar producto' : 'Agregar producto'}</h3>
            {editingId && (
              <button type="button" className="button secondary" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="codigo_barras">Código de barras</label>
              <input
                id="codigo_barras"
                name="codigo_barras"
                value={form.codigo_barras}
                onChange={handleChange}
                required
                placeholder="Ej: 7501234567890"
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
                placeholder="Nombre del producto"
              />
            </div>
            <div className="field">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="costo">Costo ($)</label>
              <input
                id="costo"
                name="costo"
                type="number"
                step="0.01"
                min="0"
                value={form.costo}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label htmlFor="precio">Precio ($)</label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                value={form.precio}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
              Producto activo
            </label>
          </div>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : editingId
                ? 'Actualizar producto'
                : 'Guardar producto'}
          </button>
          {error && <div className="result-block">{error}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Listado de productos</strong>
            <span className="table-count">{filteredProducts.length} registros</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Cargando productos...</p>
            </div>
          ) : error && products.length === 0 ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>Error al cargar productos</p>
              <button className="button secondary" onClick={loadProducts}>
                Reintentar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                {search || categoryFilter ? '🔍' : '📦'}
              </span>
              <p>
                {search || categoryFilter
                  ? 'No se encontraron productos con los filtros actuales.'
                  : 'Aún no hay productos registrados.'}
              </p>
              {(search || categoryFilter) && (
                <button
                  className="button secondary"
                  onClick={() => {
                    setSearch('')
                    setCategoryFilter('')
                  }}
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
                  <span className="col-category">Categoría</span>
                  <span className="col-price">Precio</span>
                  <span className="col-stock">Stock</span>
                  <span className="col-status">Estado</span>
                  <span className="col-actions">Acciones</span>
                </div>
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <div key={product.id} className="product-row">
                      <span className="col-name">
                        <span className="product-name">{product.nombre}</span>
                        {product.codigo_barras && (
                          <span className="product-barcode">{product.codigo_barras}</span>
                        )}
                      </span>
                      <span className="col-category">
                        <span className="category-tag">{product.categoria}</span>
                      </span>
                      <span className="col-price">
                        <span className="product-price">
                          ${Number(product.precio).toFixed(2)}
                        </span>
                        {Number(product.costo) > 0 && (
                          <span className="product-cost">
                            Costo: ${Number(product.costo).toFixed(2)}
                          </span>
                        )}
                      </span>
                      <span className="col-stock">
                        <span className={stockStatus.className}>{stockStatus.label}</span>
                        <span className="stock-qty">{product.stock} uds</span>
                      </span>
                      <span className="col-status">
                        <span className={`status-badge ${product.activo ? 'status-active' : 'status-inactive'}`}>
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </span>
                      <span className="col-actions">
                        <button
                          className="action-btn action-edit"
                          onClick={() => openEdit(product)}
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => confirmDelete(product)}
                          title="Eliminar producto"
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
    </section>
  )
}

export default ProductsPage