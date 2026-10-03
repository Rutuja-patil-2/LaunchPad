import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recruiterService } from '../../services/api'
import * as Icons from 'lucide-react'

export default function ViewDrive() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [drive, setDrive] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrive()
  }, [])

  const fetchDrive = async () => {
    try {
      const response =
        await recruiterService.getDriveById(id)

      setDrive(response.data)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <button
        onClick={() =>
          navigate('/recruiter/manage-drives')
        }
        className="flex items-center gap-2 text-brand-600"
      >
        <Icons.ArrowLeft size={18}/>
        Back
      </button>

      <div className="bg-white rounded-3xl border p-8">

        <h1 className="text-4xl font-bold">
          {drive.position}
        </h1>

        <p className="text-slate-500 mt-2">
          {drive.company?.name}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div>
            <h3 className="font-semibold">
              Package
            </h3>

            <p>{drive.package}</p>
          </div>

          <div>
            <h3 className="font-semibold">
              Eligibility
            </h3>

            <p>{drive.eligibility}</p>
          </div>

          <div>
            <h3 className="font-semibold">
              Location
            </h3>

            <p>{drive.location}</p>
          </div>

          <div>
            <h3 className="font-semibold">
              Applications
            </h3>

            <p>{drive.total_applications}</p>
          </div>

        </div>

        <div className="mt-8">

          <h3 className="font-semibold mb-2">
            Required Skills
          </h3>

          <p>{drive.required_skills}</p>

        </div>

        <div className="mt-8">

          <h3 className="font-semibold mb-2">
            Job Description
          </h3>

          <p>{drive.job_description}</p>

        </div>

      </div>

    </div>
  )
}