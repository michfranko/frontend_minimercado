import { useEffect, useState } from 'react'
import { connectModule } from '../services/api'

function ModulePage({ title, endpoint, description }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    connectModule(endpoint)
      .then((data) => {
        if (!mounted) return
        const payload = data?.items || data || []
        setItems(Array.isArray(payload) ? payload : [])
        setError('')
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [endpoint])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {loading && <p>Cargando datos del backend...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-card">
          <div className="table-header">
            <strong>Datos recibidos</strong>
            <span>{items.length} registros</span>
          </div>
          {items.length === 0 ? (
            <p className="empty">No hay datos aún para mostrar.</p>
          ) : (
            <ul className="list">
              {items.slice(0, 6).map((item, idx) => (
                <li key={idx} className="list-item">
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default ModulePage
