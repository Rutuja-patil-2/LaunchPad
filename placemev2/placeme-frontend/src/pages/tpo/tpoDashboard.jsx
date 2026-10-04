import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../context/authContext'
import * as Icons from 'lucide-react'

import { StatCard } from '../../components/StatCard'
import { DashboardCard } from '../../components/DashboardCard'
import { Button } from '../../components/Button'
import { tpoApi } from '../../services/tpoapi'

const TPODashboard = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const companyName = user?.company?.name || user?.company_name || null

  const [stats, setStats] = useState({
  companies: 0,
  drives: 0,
  applications: 0,
  selected: 0,
  placementPercentage: 0,
  highestPackage: 0
})

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [companiesRes, drivesRes, applicationsRes] =
        await Promise.all([
          tpoApi.getCompanies(),
          tpoApi.getDrives(),
          tpoApi.getApplications(),
        ])

      const companies =companiesRes.data.results?.length ||companiesRes.data.length ||0

      const drives =drivesRes.data.results?.length ||drivesRes.data.length ||0
      const applicationsData =
  applicationsRes.data.results ||
  applicationsRes.data.data ||
  applicationsRes.data ||
  []

const selected =
  applicationsData.filter(
    app => app.status === 'selected'
  ).length

const placementPercentage =
  applicationsData.length > 0
    ? (
        (selected / applicationsData.length) *
        100
      ).toFixed(1)
    : 0

const drivesData =
  drivesRes.data.results ||
  drivesRes.data ||
  []

const highestPackage = Math.max(
  ...drivesData.map(
    drive => Number(drive.package || 0)
  ),
  0
)

setStats({
  companies,
  drives,
  applications: applicationsData.length,
  selected,
  placementPercentage,
  highestPackage
})


    } catch (error) {
      console.error('Dashboard Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {companyName ? `${companyName} Dashboard` : 'TPO Dashboard'}
          </h1>

          <p className="text-slate-500 mt-2">
            Manage companies, placement drives and student applications
          </p>
        </div>

        <Button
          onClick={() => navigate('/tpo/companies')}
          variant="primary"
        >
          <Icons.Building2 className="w-4 h-4" />
          Manage Companies
        </Button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Icons.Building2}
          label="Total Companies"
          value={loading ? '...' : stats.companies}
          color="blue"
        />

        <StatCard
          icon={Icons.Briefcase}
          label="Active Drives"
          value={loading ? '...' : stats.drives}
          color="purple"
        />

        <StatCard
          icon={Icons.Users}
          label="Applications"
          value={loading ? '...' : stats.applications}
          color="emerald"
        />

        <StatCard
          icon={Icons.Percent}
          label="Placement %"
          value={loading? '...': `${stats.placementPercentage}%`
  }
  color="emerald"
/>

<StatCard
  icon={Icons.IndianRupee}
  label="Highest Package"
  value={
    loading
      ? '...'
      : `${stats.highestPackage} LPA`
  }
  color="purple"
/>

        <StatCard
          icon={Icons.UserCheck}
          label="Selected Students"
          value={loading ? '...' : stats.selected}
          color="orange"
        />
      </div>

      {/* Quick Actions */}

      <DashboardCard title="Quick Actions">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/tpo/companies')}
            className="p-6 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-100 text-left transition"
          >
            <Icons.Building2 className="w-8 h-8 text-brand-600 mb-3" />

            <h3 className="font-semibold text-slate-900">
              Companies
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View and manage companies
            </p>
          </button>

          <button
            onClick={() => navigate('/tpo/drives')}
            className="p-6 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-left transition"
          >
            <Icons.Briefcase className="w-8 h-8 text-purple-600 mb-3" />

            <h3 className="font-semibold text-slate-900">
              Placement Drives
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Create and manage drives
            </p>
          </button>

          <button
            onClick={() => navigate('/tpo/students')}
            className="p-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-left transition"
          >
            <Icons.Users className="w-8 h-8 text-emerald-600 mb-3" />

            <h3 className="font-semibold text-slate-900">
              Review Students
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View student profiles and support needs
            </p>
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-6 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-100 text-left transition"
          >
            <Icons.RefreshCcw className="w-8 h-8 text-orange-600 mb-3" />

            <h3 className="font-semibold text-slate-900">
              Refresh Data
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Reload dashboard statistics
            </p>
          </button>
        </div>
      </DashboardCard>

      {/* Recent Activity */}

      <DashboardCard title="Overview">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Building2 className="w-5 h-5 text-brand-600" />

              <h3 className="font-semibold">
                Company Management
              </h3>
            </div>

            <p className="text-slate-600 text-sm">
              Add new companies, edit company information,
              manage recruitment partners and keep company
              records updated.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Briefcase className="w-5 h-5 text-purple-600" />

              <h3 className="font-semibold">
                Placement Drives
              </h3>
            </div>

            <p className="text-slate-600 text-sm">
              Create placement drives, define eligibility,
              set deadlines and monitor drive participation.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Users className="w-5 h-5 text-emerald-600" />

              <h3 className="font-semibold">
                Applications
              </h3>
            </div>

            <p className="text-slate-600 text-sm">
              Track applications, shortlist students and
              update recruitment status.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Icons.BarChart3 className="w-5 h-5 text-orange-600" />

              <h3 className="font-semibold">
                Analytics
              </h3>
            </div>

            <p className="text-slate-600 text-sm">
              Monitor placement statistics and recruitment
              performance across drives.
            </p>
          </div>
        </div>
      </DashboardCard>

      
    </div>
  )
}

export default TPODashboard


