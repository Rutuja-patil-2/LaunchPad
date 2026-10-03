import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'

import {
  authService,
  recruiterService
} from '../../services/api'

import {
  useAuthStore
} from '../../context/authContext'

export default function RecruiterNavbar() {

  const navigate = useNavigate()

  const logout =
    useAuthStore(
      state => state.logout
    )

  const [user, setUser] =
    useState({})

  const [company, setCompany] =
    useState({})

  const [searchTerm, setSearchTerm] =
    useState('')

  const [isProfileOpen, setIsProfileOpen] =
    useState(false)

  const [searchResults, setSearchResults] =
    useState([])

  useEffect(() => {

    loadProfile()

    const refresh = () => {
      loadProfile()
    }

    window.addEventListener(
      'companyUpdated',
      refresh
    )

    return () => {

      window.removeEventListener(
        'companyUpdated',
        refresh
      )
    }

  }, [])

  const loadProfile = async () => {

    try {

      const [
        userRes,
        companyRes
      ] = await Promise.all([
        authService.getProfile(),
        recruiterService.getMyCompany()
      ])

      setUser(
        userRes.data
      )

      setCompany(
        companyRes.data
      )

    } catch (error) {

      console.error(error)
    }
  }

  const handleLogout = () => {

    logout()

    navigate('/login')
  }

  const handleSearch = async (value) => {

    setSearchTerm(value)

    try {

      const [
        drivesRes,
        applicationsRes,
        interviewsRes
      ] = await Promise.all([
        recruiterService.getDrives(),
        recruiterService.getApplications(),
        recruiterService.getInterviews()
      ])

      const drives =
        drivesRes.data || []

      const applications =
        applicationsRes.data || []

      const interviews =
        interviewsRes.data || []

      const results = []

      drives.forEach(drive => {

        if (
          drive.position
            ?.toLowerCase()
            .includes(
              value.toLowerCase()
            )
        ) {

          results.push({
            type: 'Drive',
            title: drive.position
          })
        }
      })

      applications.forEach(app => {

        if (
          app.student_name
            ?.toLowerCase()
            .includes(
              value.toLowerCase()
            )
        ) {

          results.push({
            type: 'Applicant',
            title:
              app.student_name
          })
        }
      })

      interviews.forEach(interview => {

        if (
          interview.student_name
            ?.toLowerCase()
            .includes(
              value.toLowerCase()
            )
        ) {

          results.push({
            type: 'Interview',
            title:
              interview.student_name
          })
        }
      })

      setSearchResults(
        value
          ? results.slice(0, 6)
          : []
      )

    } catch (error) {

      console.error(error)
    }
  }

  return (

    <nav className="fixed top-0 left-72 right-0 z-40 flex h-20 items-center justify-between border-b border-brand-700 bg-launchpad-purple px-8 text-white">

      {/* Search */}

      <div className="relative w-full max-w-lg">

        <input
          type="text"
          placeholder="Search drives, applicants, interviews..."
          value={searchTerm}
          onChange={(e) =>
            handleSearch(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-launchpad-yellow"
        />

        <Icons.Search
          className="absolute left-4 top-3.5 text-slate-400"
          size={18}
        />

        {searchResults.length > 0 && (

          <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg overflow-hidden">

            {searchResults.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="px-4 py-3 border-b hover:bg-slate-50 cursor-pointer"
                >

                  <p className="font-medium">
                    {item.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.type}
                  </p>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-6">

        {/* Notifications */}

        <button
          className="relative rounded-lg p-2 text-white hover:bg-brand-700 hover:text-launchpad-yellow"
        >

          <Icons.Bell
            size={20}
          />

          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />

        </button>

        <div className="h-8 w-px bg-white/30" />

        {/* Profile */}

        <div className="relative">

          <button
            onClick={() =>
              setIsProfileOpen(
                !isProfileOpen
              )
            }
            className="flex items-center gap-3"
          >

            <img
              src={
                company.logo_url ||
                `https://ui-avatars.com/api/?name=${
                  company.name ||
                  user.username
                }`
              }
              alt="logo"
              className="w-10 h-10 rounded-full border"
            />

            <div className="hidden sm:block text-left">

              <h4 className="text-sm font-semibold text-white">

                {company.name ||
                  user.username}

              </h4>

              <p className="text-xs text-launchpad-yellow">

                {user.username}

              </p>

            </div>

            <Icons.ChevronDown size={16} className="text-white" />

          </button>

          {isProfileOpen && (

            <div className="absolute right-0 mt-3 w-72 bg-white border rounded-2xl shadow-xl overflow-hidden">

              <div className="p-5 border-b">

                <h3 className="font-bold">

                  {company.name}
                </h3>

                <p className="text-sm text-slate-500">

                  {user.email}
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    '/recruiter/company'
                  )
                }
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50"
              >

                <Icons.Building2
                  size={18}
                />

                Company Profile

              </button>

              <button
                onClick={() =>
                  navigate(
                    '/recruiter/analytics'
                  )
                }
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50"
              >

                <Icons.BarChart3
                  size={18}
                />

                Analytics

              </button>

              <button
                onClick={
                  handleLogout
                }
                className="w-full px-5 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50"
              >

                <Icons.LogOut
                  size={18}
                />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </nav>
  )
}