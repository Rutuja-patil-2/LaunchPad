import { useState } from 'react'
import { recruiterService } from '../../services/api'
import { toast } from 'react-toastify'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'

export default function CreateDrive() {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    drive_type: 'placement',
    position: '',
    package: '',
    ctc: '',
    eligibility: 'All',
    skills: '',
    location: '',
    deadline: '',
    drive_date: '',
    description: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.position) {
      toast.error('Position is required')
      return
    }

    if (!formData.deadline) {
      toast.error('Deadline is required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        company_id: 1, // temporary
        drive_type: formData.drive_type,
        position: formData.position,
        package: formData.package,
        ctc: formData.ctc || null,
        eligibility: formData.eligibility,
        required_skills: formData.skills,
        job_description: formData.description,
        location: formData.location,
        deadline: formData.deadline,
        drive_date: formData.drive_date || null,
      }

      await recruiterService.createDrive(payload)

      toast.success('Drive created successfully 🚀')

      setFormData({
        drive_type: 'placement',
        position: '',
        package: '',
        ctc: '',
        eligibility: 'All',
        skills: '',
        location: '',
        deadline: '',
        drive_date: '',
        description: '',
      })

    } catch (error) {
      console.error(error)

      toast.error(
        error.response?.data?.detail ||
        'Failed to create drive'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Create Drive
        </h1>

        <p className="text-slate-500 mt-2">
          Post a new opportunity for students
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-6">
          <h2 className="text-white text-xl font-semibold">
            Drive Information
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8"
        >
          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Opportunity Type
              </label>

              <select
                name="drive_type"
                value={formData.drive_type}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              >
                <option value="placement">Placement</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Position
              </label>

              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Package
              </label>

              <input
                type="text"
                name="package"
                value={formData.package}
                onChange={handleChange}
                placeholder="12 LPA"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                CTC
              </label>

              <input
                type="number"
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                placeholder="12"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Eligibility
              </label>

              <select
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              >
                <option value="All">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Bangalore"
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Required Skills
              </label>

              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Django, AWS"
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Application Deadline
              </label>

              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Drive Date
              </label>

              <input
                type="datetime-local"
                name="drive_date"
                value={formData.drive_date}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">
              Job Description
            </label>

            <textarea
              rows="6"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and hiring process..."
              className="w-full border rounded-xl p-4"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icons.Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icons.PlusCircle className="w-5 h-5" />
                  Create Drive
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}