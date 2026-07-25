import { useEffect, useState } from 'react'
import { connectModule } from '../services/api'

const PERMISSION_GROUPS = [
  {
    group: 'General',
    permissions: [
      { key: 'dashboard.view', label: 'Ver Dashboard' },
    ],
  },
  {
    group: 'Seguridad',
    permissions: [
      { key: 'roles.view', label: 'Ver Roles' },
      { key: 'roles.create', label: 'Crear Roles' },
      { key: 'roles.edit', label: 'Editar Roles' },
      { key: 'roles.delete', label: 'Eliminar Roles' },
      { key: 'usuarios.view', label: 'Ver Usuarios' },
      { key: 'usuarios.create', label: 'Crear Usuarios' },
      { key: 'usuarios.edit', label: 'Editar Usuarios' },
    ],
  },
  {
    group: 'Operaciones',
    permissions: [
      { key: 'productos.view', label: 'Ver Productos' },
      { key: 'productos.create', label: 'Crear Productos' },
      { key: 'productos.edit', label: 'Editar Productos' },
      { key: 'clientes.view', label: 'Ver Clientes' },
      { key: 'clientes.create', label: 'Crear Clientes' },
      { key: 'proveedores.view', label: 'Ver Proveedores' },
      { key: 'ventas.view', label: 'Ver Ventas' },
      { key: 'ventas.create', label: 'Crear Ventas' },
    ],
  },
  {
    group: 'Finanzas',
    permissions: [
      { key: 'caja.view', label: 'Ver Caja' },
      { key: 'caja.apertura', label: 'Apertura de Caja' },
      { key: 'inventario.view', label: 'Ver Inventario' },
    ],
  },
  {
    group: 'Reportes',
    permissions: [
      { key: 'reportes.view', label: 'Ver Reportes' },
      { key: 'reportes.export', label: 'Exportar Reportes' },
    ],
  },
]

const DEFAULT_FORM = { nombre: '', descripcion: '', activo: true, permisos: [] }

function RolesPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchRoles = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await connectModule('/roles')
      const payload = data?.items || data || []
      setRoles(Array.isArray(payload) ? payload : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setShowForm(true)
    setSaveError('')
    setSaveSuccess('')
  }

  const openEdit = (rol) => {
    setEditingId(rol.id)
    setForm({
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || '',
      activo: rol.activo !== false,
      permisos: Array.isArray(rol.permisos) ? rol.permisos : [],
    })
    setShowForm(true)
    setSaveError('')
    setSaveSuccess('')
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setSaveError('')
    setSaveSuccess('')
  }

  const togglePermiso = (key) => {
    setForm((prev) => {
      const has = prev.permisos.includes(key)
      return {
        ...prev,
        permisos: has
          ? prev.permisos.filter((p) => p !== key)
          : [...prev.permisos, key],
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setSaveError('El nombre del rol es obligatorio.')
      return
    }
    setSaving(true)
    setSaveError('')
    setSaveSuccess('')
    try {
      const method = editingId ? 'PUT' : 'POST'
      const endpoint = editingId ? `/roles/${editingId}` : '/roles'
      const response = await connectModule(endpoint, {
        method,
        body: JSON.stringify(form),
      })
      setSaveSuccess(editingId ? 'Rol actualizado exitosamente.' : 'Rol creado exitosamente.')
      setTimeout(() => {
        closeForm()
        fetchRoles()
      }, 800)
    } catch (err) {
      setSaveError(err.message || 'Error al guardar el rol.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol?')) return
    setDeletingId(id)
    try {
      await connectModule(`/roles/${id}`, { method: 'DELETE' })
      fetchRoles()
    } catch (err) {
      setError(err.message || 'Error al eliminar el rol.')
    } finally {
      setDeletingId(null)
    }
  }

  const getPermisoCount = (permisos) => {
    if (!Array.isArray(permisos)) return 0
    return permisos.length
  }

  return (
    <section className="panel roles-panel">
      {/* Header */}
      <div className="panel-header">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h2>Roles del Sistema</h2>
          <p className="panel-description">
            Administra los roles y permisos del sistema. Cada rol define un conjunto de
            permisos que determinan el acceso a las funcionalidades.
          </p>
        </div>
        <div className="header-right">
          <button type="button" className="button primary" onClick={openCreate}>
            + Nuevo Rol
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="roles-loading">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
          <span className="roles-loading-text">Cargando roles...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="roles-error">
          <div className="roles-error-icon">⚠️</div>
          <div>
            <strong className="roles-error-title">Error al cargar roles</strong>
            <p className="roles-error-desc">{error}</p>
          </div>
          <button type="button" className="button secondary" onClick={fetchRoles}>
            Reintentar
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && roles.length === 0 && (
        <div className="roles-empty">
          <div className="roles-empty-icon">📋</div>
          <strong className="roles-empty-title">No hay roles registrados</strong>
          <p className="roles-empty-desc">
            Crea tu primer rol para comenzar a gestionar los permisos del sistema.
          </p>
          <button type="button" className="button primary" onClick={openCreate}>
            + Crear Primer Rol
          </button>
        </div>
      )}

      {/* Roles Table */}
      {!loading && !error && roles.length > 0 && (
        <div className="roles-table-container">
          <div className="roles-table-header">
            <span className="roles-table-count">{roles.length} rol(es) registrados</span>
          </div>
          <div className="roles-table">
            <div className="roles-row roles-row-header">
              <span className="roles-col-id">ID</span>
              <span className="roles-col-name">Nombre</span>
              <span className="roles-col-desc">Descripción</span>
              <span className="roles-col-perms">Permisos</span>
              <span className="roles-col-status">Estado</span>
              <span className="roles-col-actions">Acciones</span>
            </div>
            {roles.map((rol) => (
              <div key={rol.id} className="roles-row">
                <span className="roles-col-id roles-cell-id">#{rol.id}</span>
                <span className="roles-col-name roles-cell-name">
                  <strong>{rol.nombre}</strong>
                </span>
                <span className="roles-col-desc roles-cell-desc">
                  {rol.descripcion || '—'}
                </span>
                <span className="roles-col-perms">
                  <span className="roles-perm-badge">
                    {getPermisoCount(rol.permisos)} permiso(s)
                  </span>
                </span>
                <span className="roles-col-status">
                  <span className={`roles-status-pill ${rol.activo !== false ? 'active' : 'inactive'}`}>
                    {rol.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
                <span className="roles-col-actions">
                  <button
                    type="button"
                    className="roles-action-btn roles-action-edit"
                    onClick={() => openEdit(rol)}
                    title="Editar rol"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="roles-action-btn roles-action-delete"
                    onClick={() => handleDelete(rol.id)}
                    disabled={deletingId === rol.id}
                    title="Eliminar rol"
                  >
                    {deletingId === rol.id ? '⏳' : '🗑️'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="roles-modal-overlay" onClick={closeForm}>
          <div className="roles-modal" onClick={(e) => e.stopPropagation()}>
            <div className="roles-modal-header">
              <h3>{editingId ? 'Editar Rol' : 'Nuevo Rol'}</h3>
              <button type="button" className="roles-modal-close" onClick={closeForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="roles-form">
              <div className="roles-form-fields">
                <div className="field">
                  <label htmlFor="rol-nombre">Nombre del Rol *</label>
                  <input
                    id="rol-nombre"
                    type="text"
                    placeholder="Ej: Administrador"
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="rol-desc">Descripción</label>
                  <textarea
                    id="rol-desc"
                    placeholder="Describe las responsabilidades de este rol..."
                    value={form.descripcion}
                    onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="field checkbox-row">
                  <input
                    id="rol-activo"
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.checked }))}
                  />
                  <label htmlFor="rol-activo">Rol activo</label>
                </div>
              </div>

              {/* Permissions */}
              <div className="roles-permissions-section">
                <strong className="roles-permissions-title">Permisos del Rol</strong>
                <p className="roles-permissions-subtitle">
                  Selecciona los permisos que tendrá este rol.
                </p>
                <div className="roles-permissions-grid">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="roles-perm-group">
                      <div className="roles-perm-group-header">{group.group}</div>
                      {group.permissions.map((perm) => (
                        <label key={perm.key} className="roles-perm-item">
                          <input
                            type="checkbox"
                            checked={form.permisos.includes(perm.key)}
                            onChange={() => togglePermiso(perm.key)}
                          />
                          <span>{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Messages */}
              {saveError && (
                <div className="roles-save-error">
                  <span>❌</span>
                  <span>{saveError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="roles-save-success">
                  <span>✅</span>
                  <span>{saveSuccess}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="roles-form-actions">
                <button type="button" className="button secondary" onClick={closeForm}>
                  Cancelar
                </button>
                <button type="submit" className="button primary" disabled={saving}>
                  {saving
                    ? 'Guardando...'
                    : editingId
                      ? 'Actualizar Rol'
                      : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default RolesPage