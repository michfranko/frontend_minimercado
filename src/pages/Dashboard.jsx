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
    description: 'Total de productos registrados en el sistema, listos para la venta y control de stock.',
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
    borderColor: '#93c5fd',
    accentColor: '#1e40af',
    lightColor: '#dbeafe',
    pattern: '📦',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: '👥',
    endpoint: '/clientes',
    extractCount: (data) => (Array.isArray(data?.items) ? data.items.length : 0),
    subtitle: 'Registros activos',
    description: 'Personas registradas como clientes del minimercado para gestión de ventas y fidelización.',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    borderColor: '#86efac',
    accentColor: '#166534',
    lightColor: '#dcfce7',
    pattern: '👥',
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: '🚚',
    endpoint: '/proveedores',
    extractCount: (data) => (Array.isArray(data?.items) ? data.items.length : 0),
    subtitle: 'Socios comerciales',
    description: 'Empresas y personas que abastecen de productos al minimercado para mantener el inventario.',
    gradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%)',
    borderColor: '#fcd34d',
    accentColor: '#854d0e',
    lightColor: '#fef9c3',
    pattern: '🚚',
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
    description: 'Transacciones de venta realizadas. Cada venta representa un ingreso económico para el negocio.',
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    borderColor: '#f9a8d4',
    accentColor: '#9d174d',
    lightColor: '#fce7f3',
    pattern: '🛒',
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
    description: 'Productos disponibles en bodega o estantería. Un stock saludable evita desabastecimientos.',
    gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
    borderColor: '#c4b5fd',
    accentColor: '#6d28d9',
    lightColor: '#ede9fe',
    pattern: '📊',
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
    description: 'Registro de ingresos y egresos del día. La caja debe abrirse al iniciar la jornada laboral.',
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
    borderColor: '#6ee7b7',
    accentColor: '#065f46',
    lightColor: '#d1fae5',
    pattern: '💵',
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
      {/* Patrón decorativo */}
      <div className="summary-card-pattern" aria-hidden="true">
        {query.pattern.repeat(8)}
      </div>

      <div className="summary-card-top">
        <span className="summary-card-icon">{query.icon}</span>
        <span className="summary-card-label-group">
          <span className="summary-card-label">{query.label}</span>
          <span className="summary-card-subtitle">{query.subtitle}</span>
        </span>
      </div>

      <div className="summary-card-body">
        {loading ? (
          <div className="summary-loading">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="summary-loading-text">Consultando datos...</span>
          </div>
        ) : error ? (
          <div className="summary-error-state">
            <span className="summary-error-icon">📡</span>
            <span className="summary-error-title">Sin conexión</span>
            <span className="summary-error-desc">No se pudieron obtener los datos</span>
          </div>
        ) : (
          <>
            {count !== null && (
              <div className="summary-stat">
                <div className="summary-stat-row">
                  <span className="summary-stat-value">{count}</span>
                  <span className="summary-stat-label">{count === 1 ? 'registro' : 'registros'}</span>
                </div>
              </div>
            )}
            {total !== null && (
              <div className="summary-stat">
                <div className="summary-stat-row">
                  <span className="summary-stat-value summary-stat-money">
                    ${total.toFixed(2)}
                  </span>
                  <span className="summary-stat-label">en ventas totales</span>
                </div>
              </div>
            )}
            {stock !== null && (
              <div className="summary-stat">
                <div className="summary-stat-row">
                  <span className="summary-stat-value">{stock}</span>
                  <span className="summary-stat-label">unidades en stock</span>
                </div>
              </div>
            )}
            {lowStock !== null && (
              <div className={`summary-badge ${lowStock > 0 ? 'summary-badge-warn' : 'summary-badge-ok'}`}>
                {lowStock > 0 ? (
                  <>⚠️ {lowStock} producto{lowStock !== 1 ? 's' : ''} con stock bajo</>
                ) : (
                  <>✅ Stock saludable</>
                )}
              </div>
            )}
            {status !== null && (
              <div className="summary-stat">
                <div className="summary-stat-row">
                  <span className={`summary-status-pill ${status === 'Abierta' ? 'open' : 'closed'}`}>
                    {status === 'Abierta' ? '🟢' : '🔴'} {status}
                  </span>
                  {balance !== null && (
                    <span className="summary-stat-money-label">
                      Saldo inicial: <strong>${balance.toFixed(2)}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="summary-card-footer">
        <span className="summary-card-description">{query.description}</span>
      </div>
    </article>
  )
}

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState('Verificando...')
  const [summaryData, setSummaryData] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const [errorStates, setErrorStates] = useState({})
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    pingBackend()
      .then(() => setBackendStatus('Conectado'))
      .catch(() => setBackendStatus('Sin conexión'))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
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
  const totalSuppliers = summaryData.proveedores
    ? Array.isArray(summaryData.proveedores?.items)
      ? summaryData.proveedores.items.length
      : 0
    : 0
  const cashOpen = summaryData.caja?.id ? true : false

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const timeOptions = { hour: '2-digit', minute: '2-digit' }

  return (
    <section className="panel dashboard-panel">
      {/* Panel Header con bienvenida */}
      <div className="panel-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h2>Centro de operaciones</h2>
          <p className="panel-description">
            Vista unificada del minimercado. Monitorea el estado de cada área del negocio
            en tiempo real y accede rápidamente a las herramientas de gestión.
          </p>
        </div>
        <div className="header-right">
          <div className="header-datetime">
            <span className="header-date">
              {currentTime.toLocaleDateString('es-ES', dateOptions)}
            </span>
            <span className="header-time">
              {currentTime.toLocaleTimeString('es-ES', timeOptions)}
            </span>
          </div>
          <span className={`status-pill ${backendStatus === 'Conectado' ? 'ok' : 'warn'}`}>
            {backendStatus === 'Conectado' ? '🟢' : '🔴'} Backend: {backendStatus}
          </span>
        </div>
      </div>

      {/* Hero / Bienvenida */}
      <div className="dashboard-hero-section">
        <div className="hero-welcome">
          <span className="hero-greeting">
            {(() => {
              const hour = currentTime.getHours()
              if (hour < 12) return '☀️ Buenos días'
              if (hour < 18) return '🌤️ Buenas tardes'
              return '🌙 Buenas noches'
            })()}
          </span>
          <h3 className="hero-title">Panel de control del Minimercado</h3>
          <p className="hero-text">
            Este es tu centro de monitoreo general. Aquí puedes ver un resumen de cada módulo del sistema:
            productos registrados, clientes activos, proveedores, ventas realizadas, estado del inventario
            y la situación actual de la caja. Todo en un solo vistazo para que tomes decisiones informadas.
          </p>
          <div className="hero-stats-row">
            <div className="hero-stat-chip">
              <span>📦</span> <strong>{totalProducts}</strong> productos
            </div>
            <div className="hero-stat-chip">
              <span>👥</span> <strong>{totalClients}</strong> clientes
            </div>
            <div className="hero-stat-chip">
              <span>🚚</span> <strong>{totalSuppliers}</strong> proveedores
            </div>
            <div className="hero-stat-chip">
              <span>🛒</span> <strong>{totalSales}</strong> ventas
            </div>
            <div className="hero-stat-chip">
              <span>💰</span> <strong>${totalRevenue.toFixed(2)}</strong> ingresos
            </div>
          </div>
        </div>
        <div className="hero-quick-summary">
          <div className="hero-quick-item">
            <span className="hero-quick-icon">🟢</span>
            <div>
              <span className="hero-quick-value">{cashOpen ? 'Caja abierta' : 'Caja cerrada'}</span>
              <span className="hero-quick-label">Estado financiero del día</span>
            </div>
          </div>
          <div className="hero-quick-item">
            <span className="hero-quick-icon">📦</span>
            <div>
              <span className="hero-quick-value">{totalProducts} productos</span>
              <span className="hero-quick-label">Catálogo disponible para venta</span>
            </div>
          </div>
          <div className="hero-quick-item">
            <span className="hero-quick-icon">👥</span>
            <div>
              <span className="hero-quick-value">{totalClients} clientes</span>
              <span className="hero-quick-label">Base de datos de clientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resúmenes detallados por módulo */}
      <div className="section-divider">
        <span className="section-divider-icon">📋</span>
        <h3 className="section-divider-title">Resumen por áreas del negocio</h3>
        <span className="section-divider-desc">
          Cada tarjeta muestra información en tiempo real de un módulo específico del sistema.
          Pasa el cursor para ver más detalles.
        </span>
      </div>

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

      {/* Sección de herramientas y alertas */}
      <div className="section-divider">
        <span className="section-divider-icon">⚡</span>
        <h3 className="section-divider-title">Herramientas y monitoreo</h3>
        <span className="section-divider-desc">
          Accesos directos a las funcionalidades principales y alertas del sistema.
        </span>
      </div>

      <div className="dashboard-insights">
        <div className="insight-card insight-card-accesos">
          <div className="insight-card-header">
            <span className="insight-icon">📌</span>
            <h3>Accesos directos</h3>
            <span className="insight-badge">5 módulos</span>
          </div>
          <p className="insight-description">
            Navega directamente a la sección que necesitas gestionar sin pasar por el menú lateral.
          </p>
          <div className="insight-links">
            {[
              { icon: '📦', label: 'Gestionar productos', section: 'productos', desc: 'Alta, baja y modificación del catálogo' },
              { icon: '👥', label: 'Registrar clientes', section: 'clientes', desc: 'Administrar base de datos de clientes' },
              { icon: '🛒', label: 'Nueva venta', section: 'ventas', desc: 'Realizar una transacción de venta' },
              { icon: '💵', label: 'Abrir / Gestionar caja', section: 'caja', desc: 'Control de ingresos y egresos' },
              { icon: '📊', label: 'Ver inventario', section: 'inventario', desc: 'Consultar niveles de stock y movimientos' },
            ].map((link) => (
              <button
                key={link.section}
                className="insight-link-btn"
                onClick={() => {
                  const event = new CustomEvent('navigate-to', { detail: link.section })
                  window.dispatchEvent(event)
                }}
                title={`Ir a ${link.label}`}
              >
                <span className="insight-link-icon">{link.icon}</span>
                <span className="insight-link-content">
                  <span className="insight-link-label">{link.label}</span>
                  <span className="insight-link-desc">{link.desc}</span>
                </span>
                <span className="insight-link-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="insight-card insight-card-resumen">
          <div className="insight-card-header">
            <span className="insight-icon">📈</span>
            <h3>Resumen operativo</h3>
            <span className="insight-badge">KPI</span>
          </div>
          <p className="insight-description">
            Indicadores clave de rendimiento del negocio. Estos números reflejan el estado actual
            de las operaciones del minimercado.
          </p>
          <div className="insight-stats">
            <div className="insight-stat-row">
              <span className="stat-label">
                <span>📦</span> Productos en catálogo
              </span>
              <strong className="stat-value">{totalProducts}</strong>
            </div>
            <div className="insight-stat-row">
              <span className="stat-label">
                <span>👥</span> Clientes registrados
              </span>
              <strong className="stat-value">{totalClients}</strong>
            </div>
            <div className="insight-stat-row">
              <span className="stat-label">
                <span>🚚</span> Proveedores activos
              </span>
              <strong className="stat-value">{totalSuppliers}</strong>
            </div>
            <div className="insight-stat-row">
              <span className="stat-label">
                <span>🛒</span> Ventas realizadas
              </span>
              <strong className="stat-value">{totalSales}</strong>
            </div>
            <div className="insight-stat-row">
              <span className="stat-label">
                <span>💰</span> Ingresos totales
              </span>
              <strong className="stat-value stat-value-green">${totalRevenue.toFixed(2)}</strong>
            </div>
            <div className="insight-stat-row">
              <span className="stat-label">
                <span>🏦</span> Estado de caja
              </span>
              <strong className={`stat-value ${cashOpen ? 'stat-value-green' : 'stat-value-red'}`}>
                {cashOpen ? 'Abierta' : 'Cerrada'}
              </strong>
            </div>
          </div>
        </div>

        <div className="insight-card insight-card-alertas">
          <div className="insight-card-header">
            <span className="insight-icon">🔔</span>
            <h3>Alertas y notificaciones</h3>
            <span className="insight-badge">{(() => {
              const lowStockItems = Array.isArray(summaryData.inventario)
                ? summaryData.inventario.filter((item) => Number(item.stock || 0) <= 5)
                : []
              return lowStockItems.length > 0 ? `${lowStockItems.length} alertas` : 'Sin novedades'
            })()}</span>
          </div>
          <p className="insight-description">
            Notificaciones importantes sobre el estado del negocio que requieren tu atención.
          </p>
          <div className="insight-alerts">
            {/* Alerta de stock bajo */}
            {(() => {
              if (!summaryData.inventario || !Array.isArray(summaryData.inventario)) {
                return (
                  <div className="insight-alert-item insight-alert-info">
                    <span className="alert-icon">ℹ️</span>
                    <div className="alert-content">
                      <span className="alert-title">Cargando inventario...</span>
                      <span className="alert-desc">Verificando niveles de stock</span>
                    </div>
                  </div>
                )
              }
              const lowStockItems = summaryData.inventario.filter(
                (item) => Number(item.stock || 0) <= 5
              )
              if (lowStockItems.length === 0) {
                return (
                  <div className="insight-alert-item insight-alert-success">
                    <span className="alert-icon">✅</span>
                    <div className="alert-content">
                      <span className="alert-title">Stock saludable</span>
                      <span className="alert-desc">Todos los productos tienen inventario suficiente</span>
                    </div>
                  </div>
                )
              }
              return (
                <>
                  <div className="insight-alert-item insight-alert-warn">
                    <span className="alert-icon">⚠️</span>
                    <div className="alert-content">
                      <span className="alert-title">{lowStockItems.length} producto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo</span>
                      <span className="alert-desc">Se recomienda realizar pedidos a proveedores</span>
                    </div>
                  </div>
                  {lowStockItems.slice(0, 4).map((item, i) => (
                    <div key={i} className="insight-alert-item insight-alert-warn-light">
                      <span className="alert-icon">📦</span>
                      <div className="alert-content">
                        <span className="alert-title">{item.nombre}</span>
                        <span className="alert-desc">Stock actual: {item.stock} unidades — umbral crítico: 5 unidades</span>
                      </div>
                    </div>
                  ))}
                  {lowStockItems.length > 4 && (
                    <div className="insight-alert-item insight-alert-info">
                      <span className="alert-icon">➕</span>
                      <div className="alert-content">
                        <span className="alert-title">Y {lowStockItems.length - 4} producto{lowStockItems.length - 4 !== 1 ? 's' : ''} más</span>
                        <span className="alert-desc">Revisa el módulo de inventario para ver el listado completo</span>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}

            {/* Alerta de caja */}
            {cashOpen ? (
              <div className="insight-alert-item insight-alert-info">
                <span className="alert-icon">🟢</span>
                <div className="alert-content">
                  <span className="alert-title">Caja activa y operativa</span>
                  <span className="alert-desc">La caja se encuentra abierta — puedes registrar movimientos</span>
                </div>
              </div>
            ) : (
              <div className="insight-alert-item insight-alert-warn">
                <span className="alert-icon">🔴</span>
                <div className="alert-content">
                  <span className="alert-title">Caja cerrada</span>
                  <span className="alert-desc">No hay una caja activa — abre una para comenzar a operar</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard