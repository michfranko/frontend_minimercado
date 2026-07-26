import { useEffect, useState, useMemo } from 'react'
import request from '../services/api'

const emptyForm = {
  cedula: '',
  nombre: '',
  telefono: '',
  correo: '',
  activo: true,
}

const ITEMS_PER_PAGE = 10

function ClientsPage() {
  const [clients, setClients] = useState([])
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadClients = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/clientes')
      setClients(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
      showToast('Error al cargar clientes: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  // Filtered clients based on search
  const filteredClients = useMemo(() => {
    let result = clients

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(term) ||
          c.cedula?.toLowerCase().includes(term) ||
          c.telefono?.toLowerCase().includes(term) ||
          c.correo?.toLowerCase().includes(term)
      )
    }

    return result
  }, [clients, search])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage))
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredClients.slice(start, start + itemsPerPage)
  }, [filteredClients, currentPage, itemsPerPage])

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

  const openEdit = (client) => {
    setEditingId(client.id)
    setForm({
      cedula: client.cedula || '',
      nombre: client.nombre || '',
      telefono: client.telefono || '',
      correo: client.correo || '',
      activo: client.activo !== false,
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

    try {
      if (editingId) {
        await request(`/clientes/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        showToast('Cliente actualizado correctamente')
      } else {
        await request('/clientes', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        showToast('Cliente registrado correctamente')
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadClients()
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (client) => {
    setDeleteConfirm(client)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await request(`/clientes/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      showToast(`Cliente "${deleteConfirm.nombre}" eliminado`)
      setDeleteConfirm(null)
      await loadClients()
    } catch (err) {
      showToast('Error al eliminar: ' + err.message, 'error')
      setDeleteConfirm(null)
    }
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
              ¿Estás seguro de eliminar al cliente <strong>"{deleteConfirm.nombre}"</strong>?
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
          <h2>Clientes</h2>
          <p>Gestión de clientes del minimercado.</p>
        </div>
        <div className="panel-header-stats">
          <span className="stat-chip">
            <strong>{clients.length}</strong> total
          </span>
          <span className="stat-chip">
            <strong>{filteredClients.length}</strong> filtrados
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="products-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, teléfono o correo..."
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
            <h3>{editingId ? 'Editar cliente' : 'Agregar cliente'}</h3>
            {editingId && (
              <button type="button" className="button secondary" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                required
                placeholder="Número de cédula"
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
                placeholder="Nombre completo"
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
                placeholder="correo@ejemplo.com"
              />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
              Cliente activo
            </label>
          </div>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : editingId
                ? 'Actualizar cliente'
                : 'Guardar cliente'}
          </button>
          {error && <div className="result-block">{error}</div>}
        </form>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Listado de clientes</strong>
            <span className="table-count">{filteredClients.length} registros</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Cargando clientes...</p>
            </div>
          ) : error && clients.length === 0 ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>Error al cargar clientes</p>
              <button className="button secondary" onClick={loadClients}>
                Reintentar
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                {search ? '🔍' : '👤'}
              </span>
              <p>
                {search
                  ? 'No se encontraron clientes con los filtros actuales.'
                  : 'Aún no hay clientes registrados.'}
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
                  <span className="col-category">Cédula</span>
                  <span className="col-price">Teléfono</span>
                  <span className="col-stock">Correo</span>
                  <span className="col-status">Estado</span>
                  <span className="col-actions">Acciones</span>
                </div>
                {paginatedClients.map((client) => (
                  <div key={client.id} className="product-row">
                    <span className="col-name">
                      <span className="product-name">{client.nombre}</span>
                    </span>
                    <span className="col-category">
                      <span className="category-tag">{client.cedula}</span>
                    </span>
                    <span className="col-price">{client.telefono}</span>
                    <span className="col-stock">{client.correo}</span>
                    <span className="col-status">
                      <span className={`status-badge ${client.activo ? 'status-active' : 'status-inactive'}`}>
                        {client.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </span>
                    <span className="col-actions">
                      <button
                        className="action-btn action-edit"
                        onClick={() => openEdit(client)}
                        title="Editar cliente"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => confirmDelete(client)}
                        title="Eliminar cliente"
                      >
                        🗑️
                      </button>
                    </span>
                  </div>
                ))}
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

export default ClientsPage