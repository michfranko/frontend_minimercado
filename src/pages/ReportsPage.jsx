import { useEffect, useMemo, useState } from 'react'
import request from '../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af']

function formatCurrency(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '$0.00'
  return `$${numeric.toFixed(2)}`
}

function ReportsPage() {
  const [summary, setSummary] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [salesByMonth, setSalesByMonth] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

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

      setSummary(summaryData || {})
      setTopProducts(Array.isArray(topProductsData) ? topProductsData : [])
      setLowStock(Array.isArray(lowStockData) ? lowStockData : [])
      setSalesByMonth(Array.isArray(salesByMonthData) ? salesByMonthData : [])
      setLastUpdated(new Date().toLocaleString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const kpis = useMemo(() => {
    if (!summary) return []
    const totalSales = Number(summary.ventas || 0)
    const income = Number(summary.ingresos || 0)
    const avgTicket = totalSales > 0 ? income / totalSales : 0
    return [
      { label: 'Productos', value: summary.productos ?? 0, helper: 'Unidades activas en catálogo.' },
      { label: 'Clientes', value: summary.clientes ?? 0, helper: 'Clientes registrados.' },
      { label: 'Proveedores', value: summary.proveedores ?? 0, helper: 'Proveedores activos.' },
      { label: 'Ventas', value: totalSales, helper: ' Cantidad de ventas registradas.' },
      { label: 'Ingresos', value: formatCurrency(income), helper: 'Sumatoria de ingresos.' },
      { label: 'Ticket promedio', value: formatCurrency(avgTicket), helper: 'Ingreso promedio por venta.' },
    ]
  }, [summary])

  const topPieData = useMemo(() => {
    return topProducts.map((item, index) => ({
      name: item.nombre,
      value: Number(item.cantidad_vendida || 0),
      total: Number(item.total_vendido || 0),
      color: COLORS[index % COLORS.length],
    }))
  }, [topProducts])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Módulo</p>
          <h2>Reportes</h2>
          <p>Resumen ejecutivo del negocio y métricas clave.</p>
          {lastUpdated && <p className="reports-last-updated">Última actualización: {lastUpdated}</p>}
        </div>
        <button className="button secondary" type="button" onClick={loadReports} disabled={loading}>
          {loading ? 'Actualizando...' : '🔄 Actualizar datos'}
        </button>
      </div>

      {loading ? (
        <div className="reports-loading">
          <span className="reports-spinner" />
          <span>Cargando reportes...</span>
        </div>
      ) : error ? (
        <div className="result-block">⚠️ {error}</div>
      ) : (
        <>
          <div className="reports-kpis">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="kpi-card">
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-value">{kpi.value}</span>
                <span className="kpi-helper">{kpi.helper}</span>
              </article>
            ))}
          </div>

          <div className="reports-charts" style={{ marginTop: '20px' }}>
            <div className="chart-card">
              <div className="table-header">
                <strong>Ventas por mes</strong>
                <span>{salesByMonth.length} periodos</span>
              </div>
              {salesByMonth.length === 0 ? (
                <p className="empty">Sin datos de ventas por mes.</p>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={salesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'Ingresos') return [formatCurrency(value), name]
                          return [value, name]
                        }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="total_ventas" stroke="#2563eb" strokeWidth={3} name="Ventas" />
                      <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke="#16a34a" strokeWidth={3} name="Ingresos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-card">
              <div className="table-header">
                <strong>Productos más vendidos</strong>
                <span>{topProducts.length} registros</span>
              </div>
              {topProducts.length === 0 ? (
                <p className="empty">Sin datos aún.</p>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'Total vendido') return [formatCurrency(value), name]
                        return [value, name]
                      }} />
                      <Legend />
                      <Bar dataKey="cantidad_vendida" name="Cantidad" fill="#2563eb" radius={6} />
                      <Bar dataKey="total_vendido" name="Total vendido" fill="#16a34a" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="reports-bottom" style={{ marginTop: '20px' }}>
            <div className="table-card">
              <div className="table-header">
                <strong>Participación por producto</strong>
                <span>{topProducts.length} registros</span>
              </div>
              {topProducts.length === 0 ? (
                <p className="empty">Sin datos aún.</p>
              ) : (
                <div className="chart-container pie-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={topPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {topPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
                  {lowStock.map((item) => {
                    const stock = Number(item.stock)
                    const stockClass = stock <= 0 ? 'inventory-stock-danger' : stock <= 10 ? 'inventory-stock-warn' : 'inventory-stock-ok'
                    return (
                      <div key={item.id} className="product-row inventory-row">
                        <span>{item.nombre}</span>
                        <span className={stockClass}>{stock}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default ReportsPage