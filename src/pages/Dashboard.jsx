import { useEffect, useState } from 'react'
import { pingBackend } from '../services/api'

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState('Verificando...')

  useEffect(() => {
    pingBackend()
      .then(() => setBackendStatus('Conectado'))
      .catch(() => setBackendStatus('Sin conexión'))
  }, [])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Inicio</p>
          <h2>Centro de operaciones del minimercado</h2>
          <p>Un panel pensado para supervisar el negocio desde una sola vista.</p>
        </div>
        <span className={`status-pill ${backendStatus === 'Conectado' ? 'ok' : 'warn'}`}>
          Estado del backend: {backendStatus}
        </span>
      </div>

      <div className="dashboard-hero">
        <article className="hero-card">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.72)' }}>Visión operativa</p>
          <h3>Control del día a día sin perder claridad</h3>
          <p>
            El sistema centraliza productos, clientes, ventas, caja e inventario en una experiencia de gestión más ordenada,
            rápida y preparada para crecer.
          </p>
        </article>

        <div className="metric-stack">
          <div className="metric-card">
            <strong>Gestión activa</strong>
            <span>Productos, clientes y ventas en un mismo flujo.</span>
          </div>
          <div className="metric-card">
            <strong>Seguimiento de stock</strong>
            <span>Monitorea entradas, salidas y niveles críticos.</span>
          </div>
          <div className="metric-card">
            <strong>Control de caja</strong>
            <span>Registra aperturas, cierres y movimientos con facilidad.</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        <article className="card">
          <h3>Operaciones</h3>
          <p>Gestiona catálogo, ventas, inventario y caja desde módulos dedicados.</p>
        </article>
        <article className="card">
          <h3>Reportes</h3>
          <p>Consulta métricas clave para entender el rendimiento del negocio.</p>
        </article>
        <article className="card">
          <h3>Escalabilidad</h3>
          <p>La estructura ya está preparada para evolucionar hacia flujos más completos.</p>
        </article>
      </div>
    </section>
  )
}

export default Dashboard
