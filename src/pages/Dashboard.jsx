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
          <h2>Panel general del minimercado</h2>
        </div>
        <span className={`status-pill ${backendStatus === 'Conectado' ? 'ok' : 'warn'}`}>
          Backend: {backendStatus}
        </span>
      </div>

      <div className="cards-grid">
        <article className="card">
          <h3>Resumen</h3>
          <p>Vista inicial para gestionar productos, ventas, clientes y caja.</p>
        </article>
        <article className="card">
          <h3>Gestión</h3>
          <p>Se preparará la interfaz para crear, listar y editar datos del negocio.</p>
        </article>
        <article className="card">
          <h3>Reportes</h3>
          <p>Próximamente se integrarán métricas y estadísticas del backend.</p>
        </article>
      </div>
    </section>
  )
}

export default Dashboard
