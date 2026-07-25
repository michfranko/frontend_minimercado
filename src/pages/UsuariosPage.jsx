import { useEffect, useState } from 'react'
import { connectModule } from '../services/api'

const DEFAULT_FORM = {
  nombre: '',
  email: '',
  password: '',
  rol_id: '',
  activo: true,
}

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
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

  const fetchUsuarios = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await connectModule('/usuarios')
      const payload = data?.items || data || []
      setUsuarios(Array.isArray(payload) ? payload : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await connectModule('/roles')
      const payload = data?.items || data || []
      setRoles(Array.isArray(payload) ? payload : [])
    } catch {
      // Silently fail — roles are optional for the form
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchRoles()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setShowForm(true)
    setSaveError('')
    setSaveSuccess('')
  }

  const openEdit = (user) => {
    setEditingId(user.id)
    setForm({
      nombre: user.nombre || '',
      email: user.email || '',
      password: '',
      rol_id: user.rol_id?.toString() || user.rol?.id?.toString() || '',
      activo: user.activo !== false,
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

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setSaveError('El nombre del usuario es obligatorio.')
      return
    }
    if (!form.email.trim()) {
      setSaveError('El email del usuario es obligatorio.')
      return
    }
    if (!editingId && !form.password.trim()) {
      setSaveError('La contraseña es obligatoria para nuevos usuarios.')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaveSuccess('')
    try {
      const method = editingId ? 'PUT' : 'POST'
      const endpoint = editingId ? `/usuarios/${editingId}` : '/usuarios'
      const body = { ...form }
      // Don't send empty password on edit
      if (editingId && !body.password.trim()) {
        delete body.password
      }
      await connectModule(endpoint, {
        method,
        body: JSON.stringify(body),
      })
      setSaveSuccess(editingId ? 'Usuario actualizado exitosamente.' : 'Usuario creado exitosamente.')
      setTimeout(() => {
        closeForm()
        fetchUsuarios()
      }, 800)
    } catch (err) {
      setSaveError(err.message || 'Error al guardar el usuario.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return
    setDeletingId(id)
    try {
      await connectModule(`/usuarios/${id}`, { method: 'DELETE' })
      fetchUsuarios()
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario.')
    } finally {
      setDeletingId(null)
    }
  }

  const getRolNombre = (user) => {
    if (user.rol?.nombre) return user.rol.nombre
    if (user.rol_nombre) return user.rol_nombre
    const found = roles.find((r) => r.id === user.rol_id)
    if (found) return found.nombre
    return '—'
  }

  return (
    <section className="panel roles-panel">
      {/* Header */}
      <div className="panel-header">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h2>Usuarios del Sistema</h2>
          <p className="panel-description">
            Administra los usuarios del minimercado. Asigna roles y gestiona el acceso
            al sistema.
          </p>
        </div>
        <div className="header-right">
          <button type="button" className="button primary" onClick={openCreate}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="roles-loading">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
          <span className="roles-loading-text">Cargando usuarios...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="roles-error">
          <div className="roles-error-icon">⚠️</div>
          <div>
            <strong className="roles-error-title">Error al cargar usuarios</strong>
            <p className="roles-error-desc">{error}</p>
          </div>
          <button type="button" className="button secondary" onClick={fetchUsuarios}>
            Reintentar
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && usuarios.length === 0 && (
        <div className="roles-empty">
          <div className="roles-empty-icon">👥</div>
          <strong className="roles-empty-title">No hay usuarios registrados</strong>
          <p className="roles-empty-desc">
            Crea el primer usuario para comenzar a gestionar el acceso al sistema.
          </p>
          <button type="button" className="button primary" onClick={openCreate}>
            + Crear Primer Usuario
          </button>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && usuarios.length > 0 && (
        <div className="roles-table-container">
          <div className="roles-table-header">
            <span className="roles-table-count">{usuarios.length} usuario(s) registrados</span>
          </div>
          <div className="roles-table">
            <div className="roles-row roles-row-header">
              <span className="roles-col-id">ID</span>
              <span className="roles-col-name">Nombre</span>
              <span className="usuarios-col-email">Email</span>
              <span className="roles-col-perms">Rol</span>
              <span className="roles-col-status">Estado</span>
              <span className="roles-col-actions">Acciones</span>
            </div>
            {usuarios.map((user) => (
              <div key={user.id} className="roles-row usuarios-row">
                <span className="roles-col-id roles-cell-id">#{user.id}</span>
                <span className="roles-col-name roles-cell-name">
                  <strong>{user.nombre}</strong>
                </span>
                <span className="usuarios-col-email roles-cell-desc">
                  {user.email || '—'}
                </span>
                <span className="roles-col-perms">
                  <span className="roles-perm-badge">
                    {getRolNombre(user)}
                  </span>
                </span>
                <span className="roles-col-status">
                  <span className={`roles-status-pill ${user.activo !== false ? 'active' : 'inactive'}`}>
                    {user.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
                <span className="roles-col-actions">
                  <button
                    type="button"
                    className="roles-action-btn roles-action-edit"
                    onClick={() => openEdit(user)}
                    title="Editar usuario"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="roles-action-btn roles-action-delete"
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    title="Eliminar usuario"
                  >
                    {deletingId === user.id ? '⏳' : '🗑️'}
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
          <div className="roles-modal usuarios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="roles-modal-header">
              <h3>{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button type="button" className="roles-modal-close" onClick={closeForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="roles-form">
              <div className="roles-form-fields">
                <div className="field">
                  <label htmlFor="user-nombre">Nombre completo *</label>
                  <input
                    id="user-nombre"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="user-email">Correo electrónico *</label>
                  <input
                    id="user-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="user-password">
                    {editingId ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    placeholder={editingId ? '••••••••' : 'Ingresa una contraseña'}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required={!editingId}
                  />
                </div>
                <div className="field">
                  <label htmlFor="user-rol">Rol</label>
                  <select
                    id="user-rol"
                    value={form.rol_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, rol_id: e.target.value }))}
                  >
                    <option value="">Sin rol asignado</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field checkbox-row">
                  <input
                    id="user-activo"
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.checked }))}
                  />
                  <label htmlFor="user-activo">Usuario activo</label>
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
                      ? 'Actualizar Usuario'
                      : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default UsuariosPage