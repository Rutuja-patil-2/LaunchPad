import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { tpoapi } from '../../services/tpoapi'

export default function TPOMockTests() {

  const navigate = useNavigate()

  const [tests, setTests] = useState([])

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    const res = await tpoapi.getMockTests()

    setTests(
      res.data.results ||
      res.data ||
      []
    )
  }

  const deleteTest = async (id) => {

    if (!window.confirm('Delete test?'))
      return

    await tpoapi.deleteMockTest(id)

    fetchTests()
  }

  return (
    <div>

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Mock Tests
        </h1>

        <button
          onClick={() =>
            navigate('/tpo/mock-tests/create')
          }
          className="bg-brand-600 text-white px-4 py-2 rounded-xl"
        >
          Create Mock Test
        </button>

      </div>

      <div className="bg-white rounded-xl border">

        <table className="w-full">

          <thead>
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Difficulty</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Test link</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>

            {tests.map((test) => (

              <tr
                key={test.id}
                className="border-t"
              >
                <td className="p-4">
                  {test.title}
                </td>

                <td className="p-4">
                  {test.difficulty}
                </td>

                <td className="p-4">
                  {test.total_questions}
                </td>

                <td className="p-4">
                  {test.duration_minutes} min
                </td>

                <td className="p-4">
                  {test.test_url ? (
                    <a
                      href={test.test_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                    >
                      Open <Icons.ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-sm text-amber-700">Link required</span>
                  )}
                </td>

                <td className="p-4 flex gap-3">

                  <button
                    onClick={() =>
                      navigate(
                        `/tpo/mock-tests/edit/${test.id}`
                      )
                    }
                  >
                    <Icons.Pencil size={18} />
                  </button>

                  <button
                    onClick={() =>
                      deleteTest(test.id)
                    }
                  >
                    <Icons.Trash2
                      size={18}
                      className="text-red-500"
                    />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}