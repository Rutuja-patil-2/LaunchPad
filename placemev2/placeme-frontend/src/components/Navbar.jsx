import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authContext'
import { auth } from '../services/apiClient'
import { 
  BellIcon, 
  UserCircleIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { LaunchpadLogo } from './LaunchpadLogo'

const Navbar = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await auth.getProfile()
      setUser(res.data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
    } finally {
      setLoadingUser(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-launchpad-purple text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center rounded-lg bg-launchpad-pale-yellow px-3 py-1.5">
            <LaunchpadLogo size="md" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="font-medium text-white hover:text-launchpad-yellow">
              Dashboard
            </Link>
            <Link to="/drives" className="font-medium text-white hover:text-launchpad-yellow">
              Drives
            </Link>
            <Link to="/mock-tests" className="font-medium text-white hover:text-launchpad-yellow">
              Tests
            </Link>
            <Link to="/applications" className="font-medium text-white hover:text-launchpad-yellow">
              Applications
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 text-white hover:text-launchpad-yellow">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 rounded-lg p-2 hover:bg-brand-700">
                <UserCircleIcon className="h-6 w-6 text-white" />
                <span className="hidden text-sm font-medium text-white sm:inline">
                  {loadingUser ? 'Loading...' : (user?.first_name || user?.username || 'User')}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-launchpad-yellow md:hidden"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="space-y-2 border-t border-white/20 py-4 md:hidden">
            <Link 
              to="/dashboard" 
              className="block rounded px-4 py-2 text-white hover:bg-brand-700"
            >
              Dashboard
            </Link>
            <Link 
              to="/drives" 
              className="block rounded px-4 py-2 text-white hover:bg-brand-700"
            >
              Placement Drives
            </Link>
            <Link 
              to="/mock-tests" 
              className="block rounded px-4 py-2 text-white hover:bg-brand-700"
            >
              Mock Tests
            </Link>
            <Link 
              to="/applications" 
              className="block rounded px-4 py-2 text-white hover:bg-brand-700"
            >
              Applications
            </Link>
            <Link 
              to="/profile" 
              className="block rounded px-4 py-2 text-white hover:bg-brand-700"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded px-4 py-2 text-left text-red-200 hover:bg-brand-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
