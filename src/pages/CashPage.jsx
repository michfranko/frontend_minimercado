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
      {/* HEADER */}
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo financiero</p>
          <h2 style={{ fontSize: '1.6rem' }}>Caja</h2>
          <p style={{ color: '#475569', maxWidth: 600 }}>
            Controla los ingresos y egresos de tu negocio. Abre una caja para comenzar a operar,
            registra cada movimiento de dinero y consulta el estado actual en tiempo real.
          </p>
        </div>
        {activeCash && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🟢</span> Caja activa
          </span>
        )}
      </div>

      {/* ===== TARJETAS DE RESUMEN ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Estado */}
        <div
          style={{
            background: activeCash
              ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
              : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: 18,
            padding: '18px 20px',
            border: activeCash ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>{activeCash ? '🟢' : '🔴'}</span>
            <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Estado
            </span>
          </div>
          <p style={{ fontSize: '1.3rem', fontWeight: 700, color: activeCash ? '#166534' : '#64748b', margin: '0 0 4px' }}>
            {activeCash ? activeCash.estado : 'Sin caja activa'}
          </p>
          <p style={{ color: activeCash ? '#15803d' : '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
            {activeCash
              ? `#${activeCash.id} · ${new Date(activeCash.fecha_apertura || Date.now()).toLocaleString()}`
              : 'No hay caja abierta'}
          </p>
        </div>

        {/* Saldo actual */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            borderRadius: 18,
            padding: '18px 20px',
            border: '1px solid #bfdbfe',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>💵</span>
            <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Saldo actual
            </span>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e40af', margin: '0 0 4px' }}>
            ${saldoActual.toFixed(2)}
          </p>
          <p style={{ color: '#1d4ed8', fontSize: '0.82rem', margin: 0 }}>
            {activeCash
              ? `Inicial: $${Number(activeCash.saldo_inicial || 0).toFixed(2)}`
              : 'Abre una caja para empezar'}
          </p>
        </div>

        {/* Ingresos */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
            borderRadius: 18,
            padding: '18px 20px',
            border: '1px solid #fde68a',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>📈</span>
            <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ingresos
            </span>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#854d0e', margin: '0 0 4px' }}>
            +${totalIngresos.toFixed(2)}
          </p>
          <p style={{ color: '#a16207', fontSize: '0.82rem', margin: 0 }}>
            {movements.filter((m) => m.tipo_movimiento === 'INGRESO').length} registro{movements.filter((m) => m.tipo_movimiento === 'INGRESO').length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Egresos */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2, #fecaca)',
            borderRadius: 18,
            padding: '18px 20px',
            border: '1px solid #fca5a5',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>📉</span>
            <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Egresos
            </span>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>
            -${totalEgresos.toFixed(2)}
          </p>
          <p style={{ color: '#b91c1c', fontSize: '0.82rem', margin: 0 }}>
            {movements.filter((m) => m.tipo_movimiento === 'EGRESO').length} registro{movements.filter((m) => m.tipo_movimiento === 'EGRESO').length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ===== GUÍA RÁPIDA ===== */}
      <div
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          borderRadius: 18,
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.3rem' }}>📖</span>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>¿Cómo funciona la caja?</h3>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              step: '1',
              icon: '🔓',
              title: 'Abrir caja',
              desc: 'Inicia una sesión con un saldo inicial. Cada jornada debe tener su propia apertura.',
              color: '#16a34a',
              bg: '#f0fdf4',
            },
            {
              step: '2',
              icon: '📝',
              title: 'Registrar movimientos',
              desc: 'Anota cada ingreso (ventas, cobros) o egreso (gastos, compras) que ocurra durante el día.',
              color: '#2563eb',
              bg: '#eff6ff',
            },
            {
              step: '3',
              icon: '🔒',
              title: 'Cerrar caja',
              desc: 'Al finalizar, cierra la caja indicando el saldo final para cuadrar la jornada.',
              color: '#9333ea',
              bg: '#faf5ff',
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                background: item.bg,
                borderRadius: 14,
                padding: '14px 16px',
                border: `1px solid ${item.color}22`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: item.color,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {item.step}
                </span>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <strong style={{ color: item.color, fontSize: '0.9rem' }}>{item.title}</strong>
              </div>
              <p style={{ color: '#475569', fontSize: '0.83rem', margin: 0, lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LAYOUT PRINCIPAL ===== */}
      <div className="products-layout">
        {/* COLUMNA IZQUIERDA: FORMULARIOS */}
        <div
          className="form-card product-form"
          style={{ borderRadius: 18, padding: '20px 22px' }}
        >
          {!activeCash ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>🔓</span>
                <h3 style={{ margin: 0, color: '#0f172a' }}>Abrir nueva caja</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 16, lineHeight: 1.5 }}>
                Para comenzar a operar, indica el monto de dinero con el que inicia la caja el día de hoy.
                Este será tu saldo de referencia para la jornada.
              </p>
              <form className="form-grid" onSubmit={handleOpenCash}>
                <div className="field">
                  <label htmlFor="saldo_inicial" style={{ fontWeight: 600, color: '#334155' }}>
                    Saldo inicial
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      $
                    </span>
                    <input
                      id="saldo_inicial"
                      name="saldo_inicial"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.saldo_inicial}
                      onChange={(event) => setForm({ saldo_inicial: event.target.value })}
                      required
                      style={{ paddingLeft: 28 }}
                    />
                  </div>
                </div>
                <button
                  className="button primary"
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  {submitting ? 'Abriendo caja...' : '🔓 Abrir caja'}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Caja activa info */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 20,
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.3rem' }}>📋</span>
                  <h3 style={{ margin: 0, color: '#166534', fontSize: '1rem' }}>
                    Caja activa #{activeCash.id}
                  </h3>
                </div>
                <p style={{ color: '#15803d', fontSize: '0.85rem', margin: 0 }}>
                  Abierta desde {new Date(activeCash.fecha_apertura || Date.now()).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: '#16a34a',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    🟢 {activeCash.estado}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    💰 ${Number(activeCash.saldo_inicial || 0).toFixed(2)} inicial
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: '#e0f2fe',
                      color: '#075985',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    💵 ${saldoActual.toFixed(2)} actual
                  </span>
                </div>
              </div>

              {/* Registrar movimiento */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>Registrar movimiento</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 14, lineHeight: 1.5 }}>
                Selecciona el tipo, ingresa el monto y una descripción para mantener un control detallado
                de cada transacción.
              </p>
              <form className="form-grid" onSubmit={handleMovement}>
                <div className="field">
                  <label htmlFor="tipo_movimiento" style={{ fontWeight: 600, color: '#334155' }}>
                    Tipo de movimiento
                  </label>
                  <select
                    id="tipo_movimiento"
                    value={movementForm.tipo_movimiento}
                    onChange={(event) => setMovementForm((current) => ({ ...current, tipo_movimiento: event.target.value }))}
                    style={{
                      borderColor: movementForm.tipo_movimiento === 'INGRESO' ? '#86efac' : '#fca5a5',
                    }}
                  >
                    <option value="INGRESO">💰 Ingreso — Dinero que entra (ventas, pagos, etc.)</option>
                    <option value="EGRESO">💸 Egreso — Dinero que sale (gastos, compras, etc.)</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="monto" style={{ fontWeight: 600, color: '#334155' }}>
                    Monto
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      $
                    </span>
                    <input
                      id="monto"
                      name="monto"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={movementForm.monto}
                      onChange={(event) => setMovementForm((current) => ({ ...current, monto: event.target.value }))}
                      required
                      style={{ paddingLeft: 28 }}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="descripcion" style={{ fontWeight: 600, color: '#334155' }}>
                    Descripción
                  </label>
                  <input
                    id="descripcion"
                    name="descripcion"
                    placeholder="Ej: Pago de servicios, Venta del día, Compra de mercadería..."
                    value={movementForm.descripcion}
                    onChange={(event) => setMovementForm((current) => ({ ...current, descripcion: event.target.value }))}
                    required
                  />
                </div>
                <button
                  className="button primary"
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                >
                  {submitting ? 'Guardando...' : '💾 Guardar movimiento'}
                </button>
              </form>

              {/* Cerrar caja */}
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>🔒</span>
                  <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1rem' }}>Cerrar caja</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.5 }}>
                  Al finalizar la jornada, ingresa el saldo final que hay en caja para cerrarla.
                  Te sugerimos: <strong style={{ color: '#0f172a' }}>${saldoActual.toFixed(2)}</strong>
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label htmlFor="saldo_final" style={{ fontWeight: 600, color: '#334155' }}>
                      Saldo final
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      >
                        $
                      </span>
                      <input
                        id="saldo_final"
                        name="saldo_final"
                        type="number"
                        min="0"
                        step="0.01"
                        value={closeForm.saldo_final}
                        onChange={(event) => setCloseForm({ saldo_final: event.target.value })}
                        required
                        style={{ paddingLeft: 28 }}
                      />
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#991b1b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.2s',
                    }}
                    onClick={handleCloseCash}
                    disabled={submitting}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2' }}
                  >
                    {submitting ? 'Cerrando...' : '🔒 Cerrar caja'}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                fontSize: '0.88rem',
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                fontSize: '0.88rem',
              }}
            >
              {success}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: ESTADO Y MOVIMIENTOS */}
        <div
          className="table-card product-list"
          style={{ borderRadius: 18, padding: '20px 22px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Estado de caja</strong>
            </div>
            <span style={{ color: '#64748b', fontSize: '0.82rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: 999 }}>
              {cash.length} sesión{cash.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', padding: '20px 0' }}>
              <span style={{ animation: 'spin 1s linear infinite', fontSize: '1.2rem' }}>⏳</span>
              <span>Cargando estado de caja...</span>
            </div>
          ) : cash.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#94a3b8',
              }}
            >
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>🏦</span>
              <p style={{ fontSize: '0.95rem', margin: '0 0 6px', fontWeight: 600, color: '#64748b' }}>
                No hay caja abierta
              </p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                Usa el formulario de la izquierda para abrir una nueva caja.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.6fr 1fr 1.2fr 1.2fr',
                    gap: 8,
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: 10,
                    fontWeight: 700,
                    color: '#334155',
                    fontSize: '0.82rem',
                  }}
                >
                  <span>ID</span>
                  <span>Estado</span>
                  <span>Saldo inicial</span>
                  <span>Saldo final</span>
                </div>
                {cash.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '0.6fr 1fr 1.2fr 1.2fr',
                      gap: 8,
                      padding: '10px 12px',
                      border: '1px solid #e8edf7',
                      borderRadius: 10,
                      background: '#fff',
                      alignItems: 'center',
                      fontSize: '0.88rem',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8edf7' }}
                  >
                    <span style={{ fontWeight: 600, color: '#2563eb' }}>#{item.id}</span>
                    <span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 10px',
                          borderRadius: 999,
                          background: item.estado === 'ABIERTO' ? '#f0fdf4' : '#f8fafc',
                          color: item.estado === 'ABIERTO' ? '#16a34a' : '#64748b',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.estado === 'ABIERTO' ? '🟢' : '⚪'} {item.estado}
                      </span>
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      ${Number(item.saldo_inicial || 0).toFixed(2)}
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      ${Number(item.saldo_final || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Movimientos */}
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>📜</span>
                    <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>Movimientos registrados</strong>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.82rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: 999 }}>
                    {movements.length} registro{movements.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {movements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>📭</span>
                    <p style={{ fontSize: '0.88rem', margin: 0 }}>
                      Aún no hay movimientos registrados en esta caja.
                    </p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 0.8fr 1fr 1.8fr',
                        gap: 8,
                        padding: '10px 12px',
                        background: '#f8fafc',
                        borderRadius: 10,
                        fontWeight: 700,
                        color: '#334155',
                        fontSize: '0.8rem',
                        position: 'sticky',
                        top: 0,
                      }}
                    >
                      <span>Tipo</span>
                      <span>Monto</span>
                      <span>Fecha</span>
                      <span>Descripción</span>
                    </div>
                    {movements.map((mov, idx) => {
                      const esIngreso = mov.tipo_movimiento === 'INGRESO'
                      return (
                        <div
                          key={mov.id || idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 0.8fr 1fr 1.8fr',
                            gap: 8,
                            padding: '10px 12px',
                            border: `1px solid ${esIngreso ? '#bbf7d0' : '#fecaca'}`,
                            borderRadius: 10,
                            background: esIngreso ? '#fafefc' : '#fefafa',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            transition: 'border-color 0.2s, transform 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = esIngreso ? '#4ade80' : '#f87171'
                            e.currentTarget.style.transform = 'translateX(3px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = esIngreso ? '#bbf7d0' : '#fecaca'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                        >
                          <span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 10px',
                                borderRadius: 999,
                                background: esIngreso ? '#f0fdf4' : '#fef2f2',
                                color: esIngreso ? '#16a34a' : '#dc2626',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                              }}
                            >
                              {esIngreso ? '💰' : '💸'} {esIngreso ? 'Ingreso' : 'Egreso'}
                            </span>
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: esIngreso ? '#16a34a' : '#dc2626',
                              fontSize: '0.9rem',
                            }}
                          >
                            {esIngreso ? '+' : '-'}${Number(mov.monto || 0).toFixed(2)}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {mov.fecha ? new Date(mov.fecha).toLocaleString() : '-'}
                          </span>
                          <span style={{ color: '#475569', fontSize: '0.83rem' }}>
                            {mov.descripcion || 'Sin descripción'}
                          </span>
                        </div>
                      )
                    })}
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