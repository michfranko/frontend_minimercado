import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  saldo_inicial: '0',
}

function CashPage() {
  const [cash, setCash] = useState([])
  const [selectedCashId, setSelectedCashId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [movementForm, setMovementForm] = useState({ caja_id: '', tipo_movimiento: 'INGRESO', monto: '0', descripcion: '' })

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/caja/abrir', {
        method: 'POST',
        body: JSON.stringify({ saldo_inicial: 0 }),
      }).catch(() => null)

      if (data) {
        setCash([data])
        setSelectedCashId(String(data.id))
      } else {
        setCash([])
        setSelectedCashId('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCash = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const result = await request('/caja/abrir', {
        method: 'POST',
        body: JSON.stringify({ saldo_inicial: Number(form.saldo_inicial) }),
      })
      setCash([result])
      setSelectedCashId(String(result.id))
      setSuccess('Caja abierta correctamente')
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMovement = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        caja_id: Number(movementForm.caja_id || selectedCashId),
        tipo_movimiento: movementForm.tipo_movimiento,
        monto: Number(movementForm.monto),
        descripcion: movementForm.descripcion,
      }
      await request('/caja/movimientos', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSuccess('Movimiento registrado correctamente')
      setMovementForm({ caja_id: selectedCashId, tipo_movimiento: 'INGRESO', monto: '0', descripcion: '' })
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
          <h2>Caja</h2>
          <p>Apertura de caja, movimientos y estado básico.</p>
        </div>
      </div>

      <div className="products-layout">
        <div className="form-card product-form">
          <h3>Abrir caja</h3>
          <form className="form-grid" onSubmit={handleOpenCash}>
            <div className="field">
              <label htmlFor="saldo_inicial">Saldo inicial</label>
              <input id="saldo_inicial" name="saldo_inicial" type="number" min="0" value={form.saldo_inicial} onChange={(event) => setForm({ saldo_inicial: event.target.value })} required />
            </div>
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Procesando...' : 'Abrir caja'}
            </button>
          </form>

          <h3 style={{ marginTop: '20px' }}>Registrar movimiento</h3>
          <form className="form-grid" onSubmit={handleMovement}>
            <div className="field">
              <label htmlFor="caja_id">Caja</label>
              <input id="caja_id" name="caja_id" value={movementForm.caja_id || selectedCashId} onChange={(event) => setMovementForm((current) => ({ ...current, caja_id: event.target.value }))} required />
            </div>
            <div className="field">
              <label htmlFor="tipo_movimiento">Tipo</label>
              <select id="tipo_movimiento" value={movementForm.tipo_movimiento} onChange={(event) => setMovementForm((current) => ({ ...current, tipo_movimiento: event.target.value }))}>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="monto">Monto</label>
              <input id="monto" name="monto" type="number" min="0" value={movementForm.monto} onChange={(event) => setMovementForm((current) => ({ ...current, monto: event.target.value }))} required />
            </div>
            <div className="field">
              <label htmlFor="descripcion">Descripción</label>
              <input id="descripcion" name="descripcion" value={movementForm.descripcion} onChange={(event) => setMovementForm((current) => ({ ...current, descripcion: event.target.value }))} required />
            </div>
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar movimiento'}
            </button>
          </form>

          {error && <div className="result-block">{error}</div>}
          {success && <div className="result-block success">{success}</div>}
        </div>

        <div className="table-card product-list">
          <div className="table-header">
            <strong>Estado de caja</strong>
            <span>{cash.length} sesión</span>
          </div>

          {loading ? (
            <p>Cargando estado de caja...</p>
          ) : cash.length === 0 ? (
            <p className="empty">No hay caja abierta todavía.</p>
          ) : (
            <div className="product-table">
              <div className="product-row product-row-header">
                <span>ID</span>
                <span>Estado</span>
                <span>Saldo inicial</span>
                <span>Saldo final</span>
              </div>
              {cash.map((item) => (
                <div key={item.id} className="product-row">
                  <span>#{item.id}</span>
                  <span>{item.estado}</span>
                  <span>${Number(item.saldo_inicial || 0).toFixed(2)}</span>
                  <span>${Number(item.saldo_final || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CashPage
