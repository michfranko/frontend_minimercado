import { useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import CashPage from './pages/CashPage'
import ClientsPage from './pages/ClientsPage'
import Dashboard from './pages/Dashboard'
import InventoryPage from './pages/InventoryPage'
import ModulePage from './pages/ModulePage'
import ProductsPage from './pages/ProductsPage'
import ReportsPage from './pages/ReportsPage'
import SalesPage from './pages/SalesPage'

const sections = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: '01',
    description: 'Vista general del negocio',
    group: 'General',
    render: () => <Dashboard />,
  },
  {
    id: 'auth',
    label: 'Autenticación',
    icon: '02',
    description: 'Inicio de sesión del sistema',
    group: 'Seguridad',
    render: () => <AuthPage />,
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: '03',
    description: 'Administración de permisos',
    group: 'Seguridad',
    render: () => <ModulePage title="Roles" endpoint="/roles" description="Gestión de roles del sistema." />,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: '04',
    description: 'Gestión de usuarios',
    group: 'Seguridad',
    render: () => <ModulePage title="Usuarios" endpoint="/usuarios" description="Listado de usuarios del minimercado." />,
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: '05',
    description: 'Catálogo y stock',
    group: 'Operaciones',
    render: () => <ProductsPage />,
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: '06',
    description: 'Registro de clientes',
    group: 'Operaciones',
    render: () => <ClientsPage />,
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: '07',
    description: 'Gestión de proveedores',
    group: 'Operaciones',
    render: () => <ModulePage title="Proveedores" endpoint="/proveedores" description="Datos de proveedores del negocio." />,
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: '08',
    description: 'Registro de ventas',
    group: 'Operaciones',
    render: () => <SalesPage />,
  },
  {
    id: 'caja',
    label: 'Caja',
    icon: '09',
    description: 'Apertura y movimientos',
    group: 'Finanzas',
    render: () => <CashPage />,
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: '10',
    description: 'Estado del stock',
    group: 'Finanzas',
    render: () => <InventoryPage />,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: '11',
    description: 'Resumen y métricas',
    group: 'Reportes',
    render: () => <ReportsPage />,
  },
]

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')

  const currentSection = sections.find((section) => section.id === activeSection) || sections[0]

  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.group]) acc[section.group] = []
    acc[section.group].push(section)
    return acc
  }, {})

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-badge">Operación corporativa</span>
          <h1>Minimercado UPS</h1>
          <p>Plataforma de supervisión y gestión para operaciones comerciales.</p>
        </div>

        <nav className="nav-list" aria-label="Secciones del sistema">
          {Object.entries(groupedSections).map(([groupName, items]) => (
            <div key={groupName} className="nav-group">
              <div className="nav-section-title">{groupName}</div>
              {items.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span>
                    <strong>{section.label}</strong>
                    <small>{section.description}</small>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="content-area">{currentSection.render()}</main>
    </div>
  )
}

export default App
