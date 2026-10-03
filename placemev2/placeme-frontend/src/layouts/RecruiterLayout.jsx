import { Outlet } from 'react-router-dom'
import { RecruiterSidebar } from '../components/recruiter/RecruiterSidebar'
import  RecruiterNavbar  from '../components/recruiter/RecruiterNavbar'

export default function RecruiterLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterSidebar />
      <RecruiterNavbar />

      <main className="ml-72 pt-24 px-8 pb-8">
        <Outlet />
      </main>
    </div>
  )
}