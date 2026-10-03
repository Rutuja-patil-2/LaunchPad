import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { tpoApi } from '../../services/tpoApi'

const ApplicationDetails = () => {

  const { id } = useParams()

  const [application, setApplication] = useState(null)

  useEffect(() => {
    loadApplication()
  }, [])

  const loadApplication = async () => {
    try {
      const res = await tpoApi.getApplication(id)

      setApplication(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const updateStatus = async (status) => {
    try {

      await tpoApi.updateApplicationStatus(
        id,
        status
      )

      loadApplication()

    } catch (err) {
      console.log(err)
      alert('Failed to update')
    }
  }

  if (!application)
    return <div>Loading...</div>

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Application Details
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border">

        <p>
          <strong>Student:</strong>{' '}
          {application.student}
        </p>

        <p>
          <strong>Company:</strong>{' '}
          {application.company_name}
        </p>

        <p>
          <strong>Position:</strong>{' '}
          {application.position}
        </p>

        <p>
          <strong>Status:</strong>{' '}
          {application.status}
        </p>

        <p>
          <strong>Resume:</strong>{' '}
          <a href={application.resume_url}
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 underline">
            View Resume
          </a>
        </p>

      </div>

      <div className="flex gap-4">

        <button
          onClick={() =>
            updateStatus('shortlisted')
          }
          className="bg-brand-600 text-white px-5 py-3 rounded-xl"
        >
          Shortlist
        </button>

        <button
          onClick={() =>
            updateStatus('selected')
          }
          className="bg-green-600 text-white px-5 py-3 rounded-xl"
        >
          Select
        </button>

        <button
          onClick={() =>
            updateStatus('rejected')
          }
          className="bg-red-600 text-white px-5 py-3 rounded-xl"
        >
          Reject
        </button>

      </div>

    </div>
  )
}

export default ApplicationDetails