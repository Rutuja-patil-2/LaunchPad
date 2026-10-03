import * as Icons from 'lucide-react'
import { useAuthStore } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

export default function TPONavbar() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="fixed top-0 left-72 right-0 flex h-20 items-center justify-between border-b border-brand-700 bg-launchpad-purple px-8 text-white">

      <div>
        <h2 className="text-xl font-semibold">{user?.company?.name || user?.company_name || 'Placement and Training Management Portal'}</h2>
      </div>

      <div className="flex items-center gap-5">

        <Icons.Bell />

        <div className="flex items-center gap-2">

          <div className="h-10 w-10 rounded-full bg-launchpad-yellow" />

          <div>
            <p className="font-medium">{user?.full_name || user?.username || 'TPO Admin'}</p>
            <p className="text-xs text-launchpad-yellow">Administrator</p>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tpo/profile')}
            className="text-sm text-white hover:text-launchpad-yellow hover:underline"
            aria-label="Profile"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="ml-4 text-sm text-red-200 hover:text-white hover:underline"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}