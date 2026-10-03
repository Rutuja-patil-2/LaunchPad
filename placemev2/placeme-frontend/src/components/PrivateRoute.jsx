import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

const PrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('access_token')
    setHasToken(!!token)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no token, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  // Token exists, allow access
  return <Outlet />
}

export default PrivateRoute
