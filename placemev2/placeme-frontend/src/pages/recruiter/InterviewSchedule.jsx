import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { toast } from 'react-toastify'
import { recruiterService } from '../../services/api'

export default function InterviewSchedule() {
   
  
  const updateInterviewStatus = async (
  id,
  status
) => {

  try {

    await recruiterService.updateInterviewStatus(
      id,
      status
    )

    toast.success(
      `Interview marked as ${status}`
    )

    fetchInterviews()

  } catch (error) {

    console.error(error)

    toast.error(
      'Failed to update interview'
    )
  }
}


  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    application: '',
    round_name: '',
    interview_date: '',
    meeting_link: '',
    notes: ''
  })

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {

    try {

      const response =
        await recruiterService.getInterviews()

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setInterviews(data)

    } catch (error) {

      console.error(error)

      toast.error(
        'Failed to load interviews'
      )

    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      await recruiterService.createInterview(
        formData
      )

      toast.success(
        'Interview scheduled successfully'
      )

      setFormData({
        application: '',
        round_name: '',
        interview_date: '',
        meeting_link: '',
        notes: ''
      })

      fetchInterviews()

    } catch (error) {

      console.error(error)

      toast.error(
        'Failed to schedule interview'
      )
    }
  }

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        'Delete interview?'
      )
    ) return

    try {

      await recruiterService.deleteInterview(
        id
      )

      toast.success(
        'Interview deleted'
      )

      fetchInterviews()

    } catch (error) {

      console.error(error)

      toast.error(
        'Failed to delete interview'
      )
    }
  }

  const getStatusColor = (status) => {

    switch (status) {

      case 'passed':
        return 'bg-green-100 text-green-700'

      case 'failed':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">
          Interview Schedule
        </h1>

        <p className="text-slate-500 mt-2">
          Schedule and manage candidate interviews
        </p>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-slate-500">
            Total Interviews
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {interviews.length}
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-slate-500">
            Passed
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              interviews.filter(
                i => i.status === 'passed'
              ).length
            }
          </h2>

        </div>

        <div className="bg-white rounded-2xl border p-5">

          <p className="text-slate-500">
            Pending
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {
              interviews.filter(
                i => i.status === 'scheduled'
              ).length
            }
          </h2>

        </div>

      </div>

      {/* Schedule Form */}

      <div className="bg-white rounded-3xl border p-8">

        <h2 className="text-2xl font-bold mb-6">
          Schedule New Interview
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-5"
        >

          <input
            type="number"
            name="application"
            value={formData.application}
            onChange={handleChange}
            placeholder="Application ID"
            className="border rounded-xl p-3"
            required
          />

          <input
            type="text"
            name="round_name"
            value={formData.round_name}
            onChange={handleChange}
            placeholder="Technical Round"
            className="border rounded-xl p-3"
            required
          />

          <input
            type="datetime-local"
            name="interview_date"
            value={formData.interview_date}
            onChange={handleChange}
            className="border rounded-xl p-3"
            required
          />

          <input
            type="url"
            name="meeting_link"
            value={formData.meeting_link}
            onChange={handleChange}
            placeholder="Meeting Link"
            className="border rounded-xl p-3"
          />

          <textarea
            rows="4"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Interview Notes"
            className="border rounded-xl p-3 md:col-span-2"
          />

          <button
            type="submit"
            className="bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700"
          >
            Schedule Interview
          </button>

        </form>

      </div>

      {/* Interview List */}

      <div className="grid gap-5">

        {loading && (
          <div className="text-center py-10">
            Loading...
          </div>
        )}

        {!loading &&
          interviews.map((item) => (

            <div
              key={item.id}
              className="bg-white border rounded-2xl p-6"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="text-xl font-bold">
                    {item.student_name}
                  </h3>

                  <p className="text-slate-500">
                    {item.round_name}
                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}
                >
                  {item.status}
                </span>

              </div>

              <div className="mt-4 space-y-2">

                <p>
                  📅 {new Date(
                    item.interview_date
                  ).toLocaleString()}
                </p>

                {item.meeting_link && (

                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600"
                  >
                    Join Meeting
                  </a>

                )}

                {item.notes && (
                  <p className="text-slate-600">
                    {item.notes}
                  </p>
                )}

              </div>

              <div className="flex gap-3 mt-5">

                {/* <button
  onClick={() =>
    updateInterviewStatus(
      item.id,
      'passed'
    )
  }
  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl"
>
  Passed
</button>
<button
  onClick={() =>
    updateInterviewStatus(
      item.id,
      'failed'
    )
  }
  className="px-4 py-2 bg-red-100 text-red-700 rounded-xl"
>
  Failed
</button> */}

                <button
                  onClick={() =>
                    handleDelete(item.id)
                  }
                  className="px-4 py-2 bg-slate-100 rounded-xl"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

      </div>

    </div>
  )
}