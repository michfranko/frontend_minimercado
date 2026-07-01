import { useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'

const sections = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: '⌂',
    description: 'Vista general del negocio',
    render: () => <Dashboard />,
  },
  {
    id: 'auth',
    label: 'Autenticación',
    icon: '🔐',
    description: 'Inicio de sesión del sistema',
    render: () => <AuthPage />,
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: '🛡️',
    description: 'Administración de permisos',
    render: () => <ModulePage title="Roles" endpoint="/roles" description="Gestión de roles del sistema." />,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: '👤',
    description: 'Gestión de usuarios',
    render: () => <ModulePage title="Usuarios" endpoint="/usuarios" description="Listado de usuarios del minimercado." />,
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: '📦',
    description: 'Catálogo y stock',
    render: () => <ModulePage title="Productos" endpoint="/productos" description="Catálogo de productos y precios." />,
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: '🧾',
    description: 'Registro de clientes',
    render: () => <ModulePage title="Clientes" endpoint="/clientes" description="Información básica de clientes." />,
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: '🚚',
    description: 'Gestión de proveedores',
    render: () => <ModulePage title="Proveedores" endpoint="/proveedores" description="Datos de proveedores del negocio." />,
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: '💵',
    description: 'Registro de ventas',
    render: () => <ModulePage title="Ventas" endpoint="/ventas" description="Historial de ventas y detalles." />,
  },
  {
    id: 'caja',
    label: 'Caja',
    icon: '🏧',
    description: 'Apertura y movimientos',
    render: () => <ModulePage title="Caja" endpoint="/caja" description="Operaciones de caja del negocio." />,
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: '📊',
    description: 'Estado del stock',
    render: () => <ModulePage title="Inventario" endpoint="/inventario" description="Consulta del inventario actual." />,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: '📈',
    description: 'Resumen y métricas',
    render: () => <ModulePage title="Reportes" endpoint="/reportes/resumen" description="Información resumida del negocio." />,
  },
]

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')

  const currentSection = sections.find((section) => section.id === activeSection) || sections[0]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Frontend</p>
          <h1>Minimercado UPS</h1>
          <p>Base visual inicial para conectar con el backend.</p>
        </div>

        <nav className="nav-list" aria-label="Secciones del sistema">
          {sections.map((section) => (
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
        </nav>
      </aside>

      <main className="content-area">{currentSection.render()}</main>
    </div>
  )
}

export default App
