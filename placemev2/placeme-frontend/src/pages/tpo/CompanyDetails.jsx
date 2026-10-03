import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoApi } from '../../services/tpoApi'

const CompanyDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompany()
  }, [id])

  const fetchCompany = async () => {
    try {
      const res = await tpoApi.getCompany(id)
      setCompany(res.data)
    } catch (err) {
      console.log(err)
      alert('Failed to load company details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {company?.name || 'Company Details'}
          </h1>
          <p className="text-slate-500">
            Full company information
          </p>
        </div>

        <button
          onClick={() => navigate('/tpo/companies')}
          className="border px-4 py-2 rounded-xl"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Company name" value={company?.name} />
        <Info label="Industry" value={company?.industry} />
        <Info label="Location" value={company?.location} />
        <Info label="Website" value={company?.website} />
        <Info label="Contact person" value={company?.recruiter_username} />
        <Info label="Contact email" value={company?.recruiter_email} />
        <Info
          label="Verification"
          value={company?.is_verified ? 'Verified' : 'Pending verification'}
        />
        <Info label="Logo URL" value={company?.logo_url} />
        <Info label="Description" value={company?.description} wide />
      </div>
    </div>
  )
}

const Info = ({ label, value, wide = false }) => (
  <div className={wide ? 'md:col-span-2' : ''}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="font-medium text-slate-900 whitespace-pre-wrap break-words">
      {value || '-'}
    </p>
  </div>
)

export default CompanyDetails
