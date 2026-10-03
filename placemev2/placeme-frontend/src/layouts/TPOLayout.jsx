import { Outlet } from 'react-router-dom'

import TPOSidebar from '../components/TPOSidebar'
import TPONavbar from '../components/TPONavbar'

export default function TPOLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <TPOSidebar />

      <TPONavbar />

      <main className="ml-72 mt-20 p-8">
        <Outlet />
      </main>

    </div>
  )
}