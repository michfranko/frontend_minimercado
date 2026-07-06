import { useEffect, useState } from 'react'
import request from '../services/api'

function ReportsPage() {
  const [summary, setSummary] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [salesByMonth, setSalesByMonth] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      setError('')
      try {
        const [summaryData, topProductsData, lowStockData, salesByMonthData] = await Promise.all([
          request('/reportes/resumen'),
          request('/reportes/productos-mas-vendidos'),
          request('/reportes/stock-bajo'),
          request('/reportes/ventas-por-mes'),
        ])

        setSummary(summaryData)
        setTopProducts(Array.isArray(topProductsData) ? topProductsData : [])
        setLowStock(Array.isArray(lowStockData) ? lowStockData : [])
        setSalesByMonth(Array.isArray(salesByMonthData) ? salesByMonthData : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Reportes</h2>
          <p>Resumen ejecutivo del negocio y métricas clave.</p>
        </div>
      </div>

      {loading ? (
        <p>Cargando reportes...</p>
      ) : error ? (
        <div className="result-block">{error}</div>
      ) : (
        <>
          <div className="cards-grid">
            <article className="card">
              <h3>Productos</h3>
              <p>{summary?.productos ?? 0}</p>
            </article>
            <article className="card">
              <h3>Clientes</h3>
              <p>{summary?.clientes ?? 0}</p>
            </article>
            <article className="card">
              <h3>Proveedores</h3>
              <p>{summary?.proveedores ?? 0}</p>
            </article>
            <article className="card">
              <h3>Ventas</h3>
              <p>{summary?.ventas ?? 0}</p>
            </article>
            <article className="card">
              <h3>Ingresos</h3>
              <p>${Number(summary?.ingresos ?? 0).toFixed(2)}</p>
            </article>
          </div>

          <div className="products-layout" style={{ marginTop: '20px' }}>
            <div className="table-card">
              <div className="table-header">
                <strong>Productos más vendidos</strong>
                <span>{topProducts.length} registros</span>
              </div>
              {topProducts.length === 0 ? (
                <p className="empty">Sin datos aún.</p>
              ) : (
                <div className="product-table">
                  <div className="product-row product-row-header">
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Total</span>
                  </div>
                  {topProducts.map((item) => (
                    <div key={item.producto_id} className="product-row">
                      <span>{item.nombre}</span>
                      <span>{item.cantidad_vendida}</span>
                      <span>${Number(item.total_vendido).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="table-card">
              <div className="table-header">
                <strong>Stock bajo</strong>
                <span>{lowStock.length} registros</span>
              </div>
              {lowStock.length === 0 ? (
                <p className="empty">No hay productos con stock bajo.</p>
              ) : (
                <div className="product-table">
                  <div className="product-row product-row-header">
                    <span>Producto</span>
                    <span>Stock</span>
                  </div>
                  {lowStock.map((item) => (
                    <div key={item.id} className="product-row">
                      <span>{item.nombre}</span>
                      <span>{item.stock}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="table-card" style={{ marginTop: '20px' }}>
            <div className="table-header">
              <strong>Ventas por mes</strong>
              <span>{salesByMonth.length} periodos</span>
            </div>
            {salesByMonth.length === 0 ? (
              <p className="empty">Sin datos de ventas por mes.</p>
            ) : (
              <div className="product-table">
                <div className="product-row product-row-header">
                  <span>Mes</span>
                  <span>Ventas</span>
                  <span>Ingresos</span>
                </div>
                {salesByMonth.map((item) => (
                  <div key={item.mes} className="product-row">
                    <span>{item.mes}</span>
                    <span>{item.total_ventas}</span>
                    <span>${Number(item.ingresos).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default ReportsPage
