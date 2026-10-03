import { useLocation, useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { LaunchpadLogo } from './LaunchpadLogo'

export default function TPOSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

 const menuItems = [
  {
    name: 'Dashboard',
    icon: Icons.LayoutDashboard,
    path: '/tpo',
  },
  {
    name: 'Companies',
    icon: Icons.Building2,
    path: '/tpo/companies',
  },
  {
    name: 'Drives',
    icon: Icons.Briefcase,
    path: '/tpo/drives',
  },
  {
    name: 'Applications',
    icon: Icons.FileText,
    path: '/tpo/applications',
  },
  {
    name: 'Students',
    icon: Icons.Users,
    path: '/tpo/students',
  },
  {
    name: 'Courses',
    icon: Icons.BookOpen,
    path: '/tpo/courses',
  },
  {
  name: 'Mock Tests',
  icon: Icons.FileCheck,
  path: '/tpo/mock-tests',
},
]

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200">

      <div className="h-20 flex items-center px-6 border-b">
        <div>
          <LaunchpadLogo size="md" />
          <p className="text-sm text-launchpad-slate mt-1">
            PTM Portal
          </p>
        </div>
      </div>

      <div className="p-4 space-y-2">

        {menuItems.map((item) => {

          const Icon = item.icon

          const active =
            location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                active
                  ? 'bg-brand-100 text-brand-700'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}