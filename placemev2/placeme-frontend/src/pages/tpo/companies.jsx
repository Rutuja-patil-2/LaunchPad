import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { tpoApi } from '../../services/tpoApi'
import { useNavigate } from 'react-router-dom'

const TPOCompanies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await tpoApi.getCompanies()
      setCompanies(res.data.results || res.data || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
    'Delete this company?'
    )

    if (!confirmDelete) return

    try {

      await tpoApi.deleteCompany(id)

      fetchCompanies()

  } catch (err) {

    console.log(err)
    alert('Failed to delete company')

  }
}

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Companies
          </h1>

          <p className="text-slate-500">
            Manage hiring companies
          </p>
        </div>

        <button
            onClick={() => navigate('/tpo/companies/create')}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
>
            <Icons.Plus size={18} />
            Add Company
        </button>

      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>
              <th className="text-left p-4">Company</th>
              <th className="text-left p-4">Industry</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan="4" className="p-6 text-center">
                  Loading...
                </td>
              </tr>

            ) : (

              companies.map((company) => (

                <tr
                  key={company.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {company.name}
                  </td>

                  <td className="p-4">
                    {company.industry}
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${company.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {company.is_verified ? 'Verified' : 'Pending verification'}
                    </span>
                  </td>

                  <td className="p-4 flex gap-3">

                    <button
                      title="View company details"
                      onClick={() => navigate(
                        `/tpo/companies/${company.id}`
                      )}
                    >
                      <Icons.Eye
                        size={18}
                        className="text-slate-600"
                      />
                    </button>

                    <button
                      title="Edit company"
                      onClick={() => navigate(
                        `/tpo/companies/edit/${company.id}` )}
                    >
                      <Icons.Pencil
                        size={18}
                        className="text-brand-600"
                      />
                    </button>

                    <button
                      title="Delete company"
                      onClick={() => handleDelete(company.id)}
                    >
                      <Icons.Trash2 size={18} className="text-red-500"/>
                    </button>

                  </td>
                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default TPOCompanies
