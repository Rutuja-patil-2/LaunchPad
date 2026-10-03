import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../context/authContext'

const TPOProfile = () => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-slate-500">Your account details</p>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-slate-500">Name</h3>
            <p className="font-medium">{user?.full_name || user?.username || '—'}</p>
          </div>

          <div>
            <h3 className="text-sm text-slate-500">Email</h3>
            <p className="font-medium">{user?.email || '—'}</p>
          </div>

          <div>
            <h3 className="text-sm text-slate-500">Role</h3>
            <p className="font-medium">{user?.role || 'tpo'}</p>
          </div>

          <div>
            <h3 className="text-sm text-slate-500">Username</h3>
            <p className="font-medium">{user?.username || '—'}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/tpo')}
            className="border px-4 py-2 rounded-lg"
          >
            Back
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default TPOProfile
