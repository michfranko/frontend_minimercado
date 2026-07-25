import { useEffect, useState } from 'react'
import { pingBackend } from '../services/api'
import request from '../services/api'

const summaryQueries = [
  {
    id: 'productos',
    label: 'Productos',
    icon: '📦',
    endpoint: '/productos',
    extractCount: (data) => (Array.isArray(data?.items) ? data.items.length : 0),
    subtitle: 'Catálogo activo',
    gradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    borderColor: '#bfdbfe',
    accentColor: '#1e40af',
    lightColor: '#dbeafe',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: '👥',
    endpoint: '/clientes',
    extractCount: (data) => (Array.isArray(data?.items) ? data.items.length : 0),
    subtitle: 'Registros activos',
    gradient: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    borderColor: '#bbf7d0',
    accentColor: '#166534',
    lightColor: '#dcfce7',
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: '🚚',
    endpoint: '/proveedores',
    extractCount: (data) => (Array.isArray(data?.items) ? data.items.length : 0),
    subtitle: 'Socios comerciales',
    gradient: 'linear-gradient(135deg, #fefce8, #fef9c3)',
    borderColor: '#fde68a',
    accentColor: '#854d0e',
    lightColor: '#fef9c3',
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: '🛒',
    endpoint: '/ventas',
    extractCount: (data) => {
      if (Array.isArray(data?.items)) return data.items.length
      return Array.isArray(data) ? data.length : 0
    },
    extractTotal: (data) => {
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
      return items.reduce((sum, item) => sum + Number(item.total || 0), 0)
    },
    subtitle: 'Historial',
    gradient: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
    borderColor: '#fbcfe8',
    accentColor: '#9d174d',
    lightColor: '#fce7f3',
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: '📊',
    endpoint: '/inventario',
    extractCount: (data) => (Array.isArray(data) ? data.length : 0),
    extractStock: (data) => {
      const items = Array.isArray(data) ? data : []
      return items.reduce((sum, item) => sum + Number(item.stock || 0), 0)
    },
    extractLowStock: (data) => {
      const items = Array.isArray(data) ? data : []
      return items.filter((item) => Number(item.stock || 0) <= 5).length
    },
    subtitle: 'Control de stock',
    gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    borderColor: '#ddd6fe',
    accentColor: '#6d28d9',
    lightColor: '#ede9fe',
  },
  {
    id: 'caja',
    label: 'Caja',
    icon: '💵',
    endpoint: '/caja/abierta',
    extractStatus: (data) => (data?.id ? 'Abierta' : 'Cerrada'),
    extractBalance: (data) => {
      if (!data?.id) return 0
      return Number(data.saldo_inicial || 0)
    },
    subtitle: 'Estado financiero',
    gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    borderColor: '#a7f3d0',
    accentColor: '#065f46',
    lightColor: '#d1fae5',
  },
]

function SummaryCard({ query, data, loading, error }) {
  const count = query.extractCount ? query.extractCount(data) : null
  const total = query.extractTotal ? query.extractTotal(data) : null
  const stock = query.extractStock ? query.extractStock(data) : null
  const lowStock = query.extractLowStock ? query.extractLowStock(data) : null
  const status = query.extractStatus ? query.extractStatus(data) : null
  const balance = query.extractBalance ? query.extractBalance(data) : null

  return (
    <article
      className="dashboard-summary-card"
      style={{
        '--card-gradient': query.gradient,
        '--card-border': query.borderColor,
        '--card-accent': query.accentColor,
        '--card-light': query.lightColor,
      }}
    >
      <div className="summary-card-top">
        <span className="summary-card-icon">{query.icon}</span>
        <span className="summary-card-label">{query.label}</span>
        <span className="summary-card-subtitle">{query.subtitle}</span>
      </div>

      <div className="summary-card-body">
        {loading ? (
          <div className="summary-loading">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        ) : error ? (
          <span className="summary-error">⛔ Sin datos</span>
        ) : (
          <>
            {count !== null && (
              <div className="summary-stat">
                <span className="summary-stat-value">{count}</span>
                <span className="summary-stat-label">{count === 1 ? 'registro' : 'registros'}</span>
              </div>
            )}
            {total !== null && (
              <div className="summary-stat">
                <span className="summary-stat-value summary-stat-money">
                  ${total.toFixed(2)}
                </span>
                <span className="summary-stat-label">en ventas</span>
              </div>
            )}
            {stock !== null && (
              <div className="summary-stat">
                <span className="summary-stat-value">{stock}</span>
                <span className="summary-stat-label">unidades totales</span>
              </div>
            )}
            {lowStock !== null && lowStock > 0 && (
              <div className="summary-badge summary-badge-warn">
                ⚠️ {lowStock} producto{lowStock !== 1 ? 's' : ''} con stock bajo
              </div>
            )}
            {status !== null && (
              <div className="summary-stat">
                <span className={`summary-status-pill ${status === 'Abierta' ? 'open' : 'closed'}`}>
                  {status === 'Abierta' ? '🟢' : '🔴'} {status}
                </span>
                {balance !== null && (
                  <span className="summary-stat-value" style={{ fontSize: '1.15rem', marginTop: 4 }}>
                    ${balance.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  )
}

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState('Verificando...')
  const [summaryData, setSummaryData] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const [errorStates, setErrorStates] = useState({})

  useEffect(() => {
    pingBackend()
      .then(() => setBackendStatus('Conectado'))
      .catch(() => setBackendStatus('Sin conexión'))
  }, [])

  useEffect(() => {
    summaryQueries.forEach((query) => {
      setLoadingStates((prev) => ({ ...prev, [query.id]: true }))
      setErrorStates((prev) => ({ ...prev, [query.id]: false }))

      request(query.endpoint)
        .then((data) => {
          setSummaryData((prev) => ({ ...prev, [query.id]: data }))
          setLoadingStates((prev) => ({ ...prev, [query.id]: false }))
        })
        .catch(() => {
          setErrorStates((prev) => ({ ...prev, [query.id]: true }))
          setLoadingStates((prev) => ({ ...prev, [query.id]: false }))
        })
    })
  }, [])

  const totalProducts = summaryData.productos
    ? Array.isArray(summaryData.productos?.items)
      ? summaryData.productos.items.length
      : 0
    : 0
  const totalClients = summaryData.clientes
    ? Array.isArray(summaryData.clientes?.items)
      ? summaryData.clientes.items.length
      : 0
    : 0
  const totalSales = summaryData.ventas
    ? (Array.isArray(summaryData.ventas?.items)
        ? summaryData.ventas.items.length
        : Array.isArray(summaryData.ventas)
          ? summaryData.ventas.length
          : 0)
    : 0
  const totalRevenue = summaryData.ventas
    ? (Array.isArray(summaryData.ventas?.items)
        ? summaryData.ventas.items
        : Array.isArray(summaryData.ventas)
          ? summaryData.ventas
          : []
      ).reduce((sum, item) => sum + Number(item.total || 0), 0)
    : 0
  const cashOpen = summaryData.caja?.id ? true : false

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Inicio</p>
          <h2>Centro de operaciones del minimercado</h2>
          <p>Panel de control con resúmenes en tiempo real de cada área del negocio.</p>
        </div>
        <span className={`status-pill ${backendStatus === 'Conectado' ? 'ok' : 'warn'}`}>
          {backendStatus === 'Conectado' ? '🟢' : '🔴'} Backend: {backendStatus}
        </span>
      </div>

      {/* Barra de métricas rápidas */}
      <div className="dashboard-quick-metrics">
        <div className="quick-metric-card">
          <span className="quick-metric-icon">📦</span>
          <div>
            <span className="quick-metric-value">{totalProducts}</span>
            <span className="quick-metric-label">Productos</span>
          </div>
        </div>
        <div className="quick-metric-card">
          <span className="quick-metric-icon">👥</span>
          <div>
            <span className="quick-metric-value">{totalClients}</span>
            <span className="quick-metric-label">Clientes</span>
          </div>
        </div>
        <div className="quick-metric-card">
          <span className="quick-metric-icon">🛒</span>
          <div>
            <span className="quick-metric-value">{totalSales}</span>
            <span className="quick-metric-label">Ventas</span>
          </div>
        </div>
        <div className="quick-metric-card">
          <span className="quick-metric-icon">💰</span>
          <div>
            <span className="quick-metric-value">${totalRevenue.toFixed(2)}</span>
            <span className="quick-metric-label">Ingresos totales</span>
          </div>
        </div>
        <div className="quick-metric-card">
          <span className="quick-metric-icon">{cashOpen ? '🟢' : '🔴'}</span>
          <div>
            <span className="quick-metric-value" style={{ fontSize: '0.8rem' }}>
              {cashOpen ? 'Caja activa' : 'Sin caja'}
            </span>
            <span className="quick-metric-label">Estado financiero</span>
          </div>
        </div>
      </div>

      {/* Grid de resúmenes por módulo */}
      <div className="dashboard-summary-grid">
        {summaryQueries.map((query) => (
          <SummaryCard
            key={query.id}
            query={query}
            data={summaryData[query.id]}
            loading={loadingStates[query.id]}
            error={errorStates[query.id]}
          />
        ))}
      </div>

      {/* Sección de información adicional */}
      <div className="dashboard-insights">
        <div className="insight-card">
          <div className="insight-card-header">
            <span className="insight-icon">📌</span>
            <h3>Accesos directos</h3>
          </div>
          <div className="insight-links">
            {[
              { icon: '📦', label: 'Gestionar productos', section: 'productos' },
              { icon: '👥', label: 'Registrar clientes', section: 'clientes' },
              { icon: '🛒', label: 'Nueva venta', section: 'ventas' },
              { icon: '💵', label: 'Abrir caja', section: 'caja' },
              { icon: '📊', label: 'Ver inventario', section: 'inventario' },
            ].map((link) => (
              <button
                key={link.section}
                className="insight-link-btn"
                onClick={() => {
                  // Use window event to navigate
                  const event = new CustomEvent('navigate-to', { detail: link.section })
                  window.dispatchEvent(event)
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
                <span className="insight-link-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-card-header">
            <span className="insight-icon">📈</span>
            <h3>Resumen operativo</h3>
          </div>
          <div className="insight-stats">
            <div className="insight-stat-row">
              <span>Productos en catálogo</span>
              <strong>{totalProducts}</strong>
            </div>
            <div className="insight-stat-row">
              <span>Clientes registrados</span>
              <strong>{totalClients}</strong>
            </div>
            <div className="insight-stat-row">
              <span>Ventas realizadas</span>
              <strong>{totalSales}</strong>
            </div>
            <div className="insight-stat-row">
              <span>Ingresos totales</span>
              <strong style={{ color: '#16a34a' }}>${totalRevenue.toFixed(2)}</strong>
            </div>
            <div className="insight-stat-row">
              <span>Estado de caja</span>
              <strong style={{ color: cashOpen ? '#16a34a' : '#dc2626' }}>
                {cashOpen ? 'Abierta' : 'Cerrada'}
              </strong>
            </div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-card-header">
            <span className="insight-icon">🔔</span>
            <h3>Alertas</h3>
          </div>
          <div className="insight-alerts">
            {summaryData.inventario && Array.isArray(summaryData.inventario) ? (
              (() => {
                const lowStockItems = summaryData.inventario.filter(
                  (item) => Number(item.stock || 0) <= 5
                )
                if (lowStockItems.length === 0) {
                  return (
                    <div className="insight-alert-item insight-alert-success">
                      <span>✅</span>
                      <span>Todo en stock — sin alertas críticas</span>
                    </div>
                  )
                }
                return lowStockItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="insight-alert-item insight-alert-warn">
                    <span>⚠️</span>
                    <span>
                      <strong>{item.nombre}</strong> — stock bajo ({item.stock} unidades)
                    </span>
                  </div>
                ))
              })()
            ) : (
              <div className="insight-alert-item insight-alert-info">
                <span>ℹ️</span>
                <span>Cargando información de inventario...</span>
              </div>
            )}
            {cashOpen && (
              <div className="insight-alert-item insight-alert-info">
                <span>🟢</span>
                <span>Caja se encuentra activa y operativa</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard