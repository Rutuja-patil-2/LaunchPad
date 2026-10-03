import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { notifications } from '../services/apiClient'

export const InterviewExperience = () => {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] =
    useState('all')

  const [showModal, setShowModal] =
    useState(false)

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    difficulty: 'medium',
    rounds: '',
    questions_asked: '',
    tips: '',
    result: 'selected',
    date: ''
  })

  // ============================================
  // FETCH EXPERIENCES
  // ============================================

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      setLoading(true)

      const response =
        await notifications.getExperiences()

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setExperiences(data)

    } catch (error) {
      console.error(
        'Failed to fetch experiences:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // CREATE EXPERIENCE
  // ============================================

  const handleCreateExperience = async (
    e
  ) => {
    e.preventDefault()

    try {
      const response =
        await notifications.createExperience(
          formData
        )

      const newExperience =
        response.data

      setExperiences((prev) => [
        newExperience,
        ...prev
      ])

      setShowModal(false)

      setFormData({
        company: '',
        position: '',
        difficulty: 'medium',
        rounds: '',
        questions_asked: '',
        tips: '',
        result: 'selected',
        date: ''
      })

    } catch (error) {
      console.error(
        'Failed to create experience:',
        error
      )
    }
  }

  // ============================================
  // FILTERING
  // ============================================

  const filteredExperiences =
    useMemo(() => {
      return experiences.filter(
        (exp) => {
          const matchesSearch =
            exp.company
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            exp.position
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )

          const matchesDifficulty =
            difficultyFilter === 'all'
              ? true
              : exp.difficulty ===
                difficultyFilter

          return (
            matchesSearch &&
            matchesDifficulty
          )
        }
      )
    }, [
      experiences,
      searchTerm,
      difficultyFilter
    ])

  // ============================================
  // TRENDING
  // ============================================

  const trendingExperiences = [
    ...filteredExperiences
  ]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)

  // ============================================
  // COLORS
  // ============================================

  const getDifficultyColor = (
    difficulty
  ) => {
    switch (difficulty) {
      case 'easy':
        return 'success'

      case 'medium':
        return 'warning'

      case 'hard':
        return 'danger'

      default:
        return 'secondary'
    }
  }

  const getResultColor = (result) => {
    switch (result) {
      case 'selected':
        return 'success'

      case 'rejected':
        return 'danger'

      default:
        return 'secondary'
    }
  }

  // ============================================
  // UPVOTE
  // ============================================

  const handleUpvote = async (id) => {
    try {
      await notifications.upvoteExperience(
        id
      )

      setExperiences((prev) =>
        prev.map((exp) =>
          exp.id === id
            ? {
                ...exp,
                upvotes:
                  exp.upvotes + 1
              }
            : exp
        )
      )

    } catch (error) {
      console.error(
        'Failed to upvote:',
        error
      )
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">

          <div className="w-14 h-14 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600 text-lg">
            Loading interview experiences...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Interview Experiences
        </h1>

        <p className="text-slate-600">
          Learn from real student interview
          experiences
        </p>
      </motion.div>

      {/* TOP ACTIONS */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="flex flex-col lg:flex-row gap-4"
      >

        {/* SHARE BUTTON */}
        <Button
          variant="primary"
          onClick={() =>
            setShowModal(true)
          }
        >
          <Icons.Plus className="w-4 h-4" />

          Share Experience
        </Button>

        {/* SEARCH */}
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-all"
          />

          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        </div>
      </motion.div>

      {/* FILTERS */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="flex flex-wrap gap-3"
      >
        <Button
          variant={
            difficultyFilter === 'all'
              ? 'primary'
              : 'secondary'
          }
          size="sm"
          onClick={() =>
            setDifficultyFilter('all')
          }
        >
          All
        </Button>

        <Button
          variant={
            difficultyFilter === 'easy'
              ? 'primary'
              : 'secondary'
          }
          size="sm"
          onClick={() =>
            setDifficultyFilter('easy')
          }
        >
          Easy
        </Button>

        <Button
          variant={
            difficultyFilter === 'medium'
              ? 'primary'
              : 'secondary'
          }
          size="sm"
          onClick={() =>
            setDifficultyFilter(
              'medium'
            )
          }
        >
          Medium
        </Button>

        <Button
          variant={
            difficultyFilter === 'hard'
              ? 'primary'
              : 'secondary'
          }
          size="sm"
          onClick={() =>
            setDifficultyFilter('hard')
          }
        >
          Hard
        </Button>
      </motion.div>

      {/* TRENDING */}
      {trendingExperiences.length >
        0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
        >
          <div className="flex items-center gap-2 mb-5">

            <Icons.TrendingUp className="w-6 h-6 text-brand-600" />

            <h2 className="text-2xl font-bold text-slate-900">
              Trending Experiences
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {trendingExperiences.map(
              (exp) => (
                <motion.div
                  key={exp.id}
                  whileHover={{
                    y: -5
                  }}
                  className="p-6 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white"
                >

                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {exp.company}
                      </h3>

                      <p className="text-slate-600 text-sm">
                        {exp.position}
                      </p>
                    </div>

                    <Badge
                      variant={getDifficultyColor(
                        exp.difficulty
                      )}
                    >
                      {exp.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-brand-600 font-semibold">

                    <Icons.ThumbsUp className="w-4 h-4" />

                    {exp.upvotes} upvotes
                  </div>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* EXPERIENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {filteredExperiences.map(
          (exp, index) => (
            <motion.div
              key={exp.id}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay:
                  index * 0.05
              }}
              whileHover={{
                y: -5
              }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
            >

              {/* TOP */}
              <div className="flex items-start justify-between mb-5">

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {exp.company}
                  </h2>

                  <p className="text-slate-600 mt-1">
                    {exp.position}
                  </p>
                </div>

                <Badge
                  variant={getResultColor(
                    exp.result
                  )}
                >
                  {exp.result}
                </Badge>
              </div>

              {/* BADGES */}
              <div className="flex flex-wrap gap-2 mb-6">

                <Badge
                  variant={getDifficultyColor(
                    exp.difficulty
                  )}
                >
                  {exp.difficulty}
                </Badge>

                <Badge variant="secondary">
                  {exp.rounds}
                </Badge>

                <Badge variant="default">
                  {new Date(
                    exp.date
                  ).toLocaleDateString()}
                </Badge>
              </div>

              {/* QUESTIONS */}
              <div className="mb-5">

                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Questions Asked
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm">
                  {
                    exp.questions_asked
                  }
                </div>
              </div>

              {/* TIPS */}
              <div className="mb-6">

                <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                  💡 Tips & Insights
                </h4>

                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                  {exp.tips}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">

                <div>
                  <p className="text-xs text-slate-500">
                    Shared by
                  </p>

                  <p className="font-semibold text-slate-900">
                    {exp.author ||
                      exp.author_name ||
                      'Anonymous'}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() =>
                      handleUpvote(
                        exp.id
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 transition-all"
                  >
                    <Icons.ThumbsUp className="w-4 h-4" />

                    {exp.upvotes}
                  </button>

                  <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all">

                    <Icons.MessageSquare className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredExperiences.length ===
        0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="py-24 text-center rounded-2xl border border-slate-200 bg-white"
        >

          <Icons.FileSearch className="w-16 h-16 text-slate-400 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No Experiences Found
          </h2>

          <p className="text-slate-600">
            No interview experiences
            match your filters.
          </p>
        </motion.div>
      )}

      {/* SHARE EXPERIENCE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-slate-900">
                Share Interview
                Experience
              </h2>

              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
              >
                <Icons.X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateExperience
              }
              className="space-y-4"
            >

              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
                required
              />

              <input
                type="text"
                placeholder="Position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
                required
              />

              <select
                value={
                  formData.difficulty
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>

              <input
                type="text"
                placeholder="Interview Rounds"
                value={formData.rounds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rounds:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
                required
              />

              <textarea
                placeholder="Questions Asked"
                value={
                  formData.questions_asked
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    questions_asked:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300 min-h-[120px]"
                required
              />

              <textarea
                placeholder="Tips & Insights"
                value={formData.tips}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tips:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300 min-h-[120px]"
                required
              />

              <select
                value={
                  formData.result
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    result:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
              >
                <option value="selected">
                  Selected
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date:
                      e.target
                        .value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Share Experience
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}