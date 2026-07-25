import { useEffect, useState } from 'react'
import request from '../services/api'

const emptyForm = {
  saldo_inicial: '0',
}

function CashPage() {
  const [cash, setCash] = useState([])
  const [movements, setMovements] = useState([])
  const [selectedCashId, setSelectedCashId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [closeForm, setCloseForm] = useState({ saldo_final: '0' })
  const [movementForm, setMovementForm] = useState({
    caja_id: '',
    tipo_movimiento: 'INGRESO',
    monto: '0',
    descripcion: '',
  })

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Usar GET /caja/abierta para ver si hay caja abierta
      const data = await request('/caja/abierta').catch(() => null)

      if (data && data.id) {
        setCash([data])
        setSelectedCashId(String(data.id))
        try {
          const movs = await request(`/caja/${data.id}/movimientos`)
          setMovements(Array.isArray(movs?.items) ? movs.items : Array.isArray(movs) ? movs : [])
        } catch {
          setMovements([])
        }
      } else {
        setCash([])
        setSelectedCashId('')
        setMovements([])
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

  useEffect(() => {
    setMovementForm((current) => ({
      ...current,
      caja_id: selectedCashId,
    }))
  }, [selectedCashId])

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
      setSuccess(`✅ Caja #${result.id} abierta correctamente con saldo inicial de $${Number(form.saldo_inicial).toFixed(2)}`)
      setForm(emptyForm)
      setMovements([])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseCash = async () => {
    if (!selectedCashId) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const saldoFinal = Number(closeForm.saldo_final)
      await request(`/caja/${selectedCashId}/cerrar`, {
        method: 'POST',
        body: JSON.stringify({ saldo_final: saldoFinal }),
      })
      setSuccess(`🔒 Caja #${selectedCashId} cerrada correctamente`)
      setCash([])
      setSelectedCashId('')
      setMovements([])
      setCloseForm({ saldo_final: '0' })
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
        caja_id: Number(movementForm.caja_id),
        tipo_movimiento: movementForm.tipo_movimiento,
        monto: Number(movementForm.monto),
        descripcion: movementForm.descripcion,
      }
      await request('/caja/movimientos', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const tipoLabel = movementForm.tipo_movimiento === 'INGRESO' ? '💰 Ingreso' : '💸 Egreso'
      setSuccess(`${tipoLabel} de $${Number(movementForm.monto).toFixed(2)} registrado correctamente`)
      setMovementForm({
        caja_id: selectedCashId,
        tipo_movimiento: 'INGRESO',
        monto: '0',
        descripcion: '',
      })
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const activeCash = cash.length > 0 ? cash[0] : null
  const totalIngresos = movements
    .filter((m) => m.tipo_movimiento === 'INGRESO')
    .reduce((sum, m) => sum + Number(m.monto || 0), 0)
  const totalEgresos = movements
    .filter((m) => m.tipo_movimiento === 'EGRESO')
    .reduce((sum, m) => sum + Number(m.monto || 0), 0)
  const saldoActual = activeCash
    ? Number(activeCash.saldo_inicial || 0) + totalIngresos - totalEgresos
    : 0

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo financiero</p>
          <h2>💰 Caja</h2>
          <p>
            Controla los ingresos y egresos de tu negocio. Abre una caja para comenzar a operar,
            registra cada movimiento de dinero y consulta el estado actual en tiempo real.
          </p>
        </div>
      </div>

      {/* ===== TARJETAS DE RESUMEN ===== */}
      <div className="cards-grid" style={{ marginBottom: 20 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
          <h3 style={{ color: '#166534' }}>📊 Estado de caja</h3>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#166534', margin: '8px 0' }}>
            {activeCash ? activeCash.estado : 'Sin caja activa'}
          </p>
          <p style={{ color: '#166534', fontSize: '0.9rem' }}>
            {activeCash
              ? `Caja #${activeCash.id} — Abierta desde ${new Date(activeCash.fecha_apertura || Date.now()).toLocaleString()}`
              : 'No hay ninguna caja abierta en este momento.'}
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
          <h3 style={{ color: '#1e40af' }}>💵 Saldo actual</h3>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e40af', margin: '8px 0' }}>
            ${saldoActual.toFixed(2)}
          </p>
          <p style={{ color: '#1e40af', fontSize: '0.9rem' }}>
            {activeCash
              ? `Saldo inicial: $${Number(activeCash.saldo_inicial || 0).toFixed(2)}`
              : 'Abre una caja para comenzar a registrar movimientos.'}
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)' }}>
          <h3 style={{ color: '#854d0e' }}>📈 Ingresos</h3>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#854d0e', margin: '8px 0' }}>
            ${totalIngresos.toFixed(2)}
          </p>
          <p style={{ color: '#854d0e', fontSize: '0.9rem' }}>
            Total de ingresos registrados en esta caja.
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)' }}>
          <h3 style={{ color: '#991b1b' }}>📉 Egresos</h3>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#991b1b', margin: '8px 0' }}>
            ${totalEgresos.toFixed(2)}
          </p>
          <p style={{ color: '#991b1b', fontSize: '0.9rem' }}>
            Total de egresos registrados en esta caja.
          </p>
        </div>
      </div>

      {/* ===== GUÍA RÁPIDA / EXPLICACIÓN ===== */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #cbd5e1',
        }}
      >
        <h3 style={{ color: '#0f172a' }}>📖 ¿Cómo funciona la caja?</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}
        >
          <div>
            <strong style={{ color: '#2563eb', display: 'block', marginBottom: 4 }}>1. Abrir caja</strong>
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
              Inicia una sesión de caja con un saldo inicial. Cada jornada de trabajo deberías
              abrir una caja nueva.
            </p>
          </div>
          <div>
            <strong style={{ color: '#2563eb', display: 'block', marginBottom: 4 }}>2. Registrar movimientos</strong>
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
              A medida que entra o sale dinero, registra <strong>Ingresos</strong> (ventas, pagos recibidos) o{' '}
              <strong>Egresos</strong> (gastos, compras, pagos a proveedores).
            </p>
          </div>
          <div>
            <strong style={{ color: '#2563eb', display: 'block', marginBottom: 4 }}>3. Cerrar caja</strong>
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
              Al finalizar la jornada, cierra la caja. El sistema calculará el saldo final
              automáticamente con todos los movimientos registrados.
            </p>
          </div>
        </div>
      </div>

      <div className="products-layout">
        {/* ===== COLUMNA IZQUIERDA: FORMULARIOS ===== */}
        <div className="form-card product-form">
          {!activeCash ? (
            <>
              <h3>🔓 Abrir nueva caja</h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 12 }}>
                Para comenzar a operar, indica el dinero con el que inicia la caja el día de hoy.
              </p>
              <form className="form-grid" onSubmit={handleOpenCash}>
                <div className="field">
                  <label htmlFor="saldo_inicial">Saldo inicial ($)</label>
                  <input
                    id="saldo_inicial"
                    name="saldo_inicial"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.saldo_inicial}
                    onChange={(event) => setForm({ saldo_inicial: event.target.value })}
                    required
                  />
                </div>
                <button className="button primary" type="submit" disabled={submitting}>
                  {submitting ? 'Abriendo caja...' : '🔓 Abrir caja'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3>📋 Caja activa #{activeCash.id}</h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 12 }}>
                La caja está abierta. Puedes registrar movimientos o cerrar la caja al finalizar la jornada.
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className="status-pill ok" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  ✅ {activeCash.estado}
                </span>
                <span className="status-pill ok" style={{ fontSize: '0.85rem', padding: '6px 14px', background: '#dbeafe', color: '#1e40af' }}>
                  💰 ${Number(activeCash.saldo_inicial || 0).toFixed(2)} inicial
                </span>
              </div>

              <h3 style={{ marginTop: 20 }}>📝 Registrar movimiento</h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 12 }}>
                Selecciona el tipo de movimiento, ingresa el monto y una descripción para llevar un control detallado.
              </p>
              <form className="form-grid" onSubmit={handleMovement}>
                <div className="field">
                  <label htmlFor="tipo_movimiento">Tipo de movimiento</label>
                  <select
                    id="tipo_movimiento"
                    value={movementForm.tipo_movimiento}
                    onChange={(event) => setMovementForm((current) => ({ ...current, tipo_movimiento: event.target.value }))}
                  >
                    <option value="INGRESO">💰 Ingreso — Dinero que entra (ventas, pagos, etc.)</option>
                    <option value="EGRESO">💸 Egreso — Dinero que sale (gastos, compras, etc.)</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="monto">Monto ($)</label>
                  <input
                    id="monto"
                    name="monto"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={movementForm.monto}
                    onChange={(event) => setMovementForm((current) => ({ ...current, monto: event.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="descripcion">Descripción</label>
                  <input
                    id="descripcion"
                    name="descripcion"
                    placeholder="Ej: Pago de servicios, Venta del día, Compra de mercadería..."
                    value={movementForm.descripcion}
                    onChange={(event) => setMovementForm((current) => ({ ...current, descripcion: event.target.value }))}
                    required
                  />
                </div>
                <button className="button primary" type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : '💾 Guardar movimiento'}
                </button>
              </form>

              <h3 style={{ marginTop: 24 }}>🔒 Cerrar caja</h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 12 }}>
                Indica el saldo final que hay en caja para cerrar la jornada.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="saldo_final">Saldo final ($)</label>
                  <input
                    id="saldo_final"
                    name="saldo_final"
                    type="number"
                    min="0"
                    step="0.01"
                    value={closeForm.saldo_final}
                    onChange={(event) => setCloseForm({ saldo_final: event.target.value })}
                    required
                  />
                </div>
                <button
                  className="button secondary"
                  style={{ color: '#991b1b', border: '1px solid #fecaca', whiteSpace: 'nowrap' }}
                  onClick={handleCloseCash}
                  disabled={submitting}
                >
                  {submitting ? 'Cerrando caja...' : '🔒 Cerrar caja'}
                </button>
              </div>
            </>
          )}

          {error && <div className="result-block">{error}</div>}
          {success && <div className="result-block success">{success}</div>}
        </div>

        {/* ===== COLUMNA DERECHA: ESTADO Y MOVIMIENTOS ===== */}
        <div className="table-card product-list">
          <div className="table-header">
            <strong>📋 Estado de caja</strong>
            <span>{cash.length} sesión{cash.length !== 1 ? 'es' : ''}</span>
          </div>

          {loading ? (
            <p>Cargando estado de caja...</p>
          ) : cash.length === 0 ? (
            <p className="empty">No hay caja abierta todavía. Usa el formulario para abrir una nueva caja.</p>
          ) : (
            <>
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

              <div style={{ marginTop: 20 }}>
                <div className="table-header">
                  <strong>📜 Movimientos registrados</strong>
                  <span>{movements.length} registro{movements.length !== 1 ? 's' : ''}</span>
                </div>

                {movements.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Aún no hay movimientos registrados en esta caja.
                  </p>
                ) : (
                  <div className="product-table" style={{ maxHeight: 300 }}>
                    <div className="product-row product-row-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 2fr' }}>
                      <span>Tipo</span>
                      <span>Monto</span>
                      <span>Fecha</span>
                      <span>Descripción</span>
                    </div>
                    {movements.map((mov, idx) => (
                      <div
                        key={mov.id || idx}
                        className="product-row"
                        style={{ gridTemplateColumns: '1fr 1fr 1fr 2fr' }}
                      >
                        <span>
                          {mov.tipo_movimiento === 'INGRESO' ? '💰 Ingreso' : '💸 Egreso'}
                        </span>
                        <span style={{ fontWeight: 600, color: mov.tipo_movimiento === 'INGRESO' ? '#166534' : '#991b1b' }}>
                          {mov.tipo_movimiento === 'INGRESO' ? '+' : '-'}${Number(mov.monto || 0).toFixed(2)}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {mov.fecha ? new Date(mov.fecha).toLocaleString() : '-'}
                        </span>
                        <span style={{ color: '#475569', fontSize: '0.88rem' }}>
                          {mov.descripcion || 'Sin descripción'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default CashPage