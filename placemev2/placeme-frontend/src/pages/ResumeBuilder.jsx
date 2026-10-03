import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import * as Icons from 'lucide-react'

import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { auth } from '../services/apiClient'

export const ResumeBuilder = () => {
  const [resumeFile, setResumeFile] = useState(null)
  const [useProfileResume, setUseProfileResume] =
    useState(false)
  const [jobDescription, setJobDescription] =
    useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [lastScore, setLastScore] = useState(null)

  useEffect(() => {
    const fetchLastScore = async () => {
      try {
        const response =
          await auth.getResumeScore()
        if (response.data?.resume_score) {
          setLastScore(
            response.data.resume_score
          )
        }
      } catch {
        // no saved score yet
      }
    }

    fetchLastScore()
  }, [])

  const handleAnalyze = async (e) => {
    e.preventDefault()

    if (jobDescription.trim().length < 50) {
      toast.error(
        'Paste a job description (at least 50 characters)'
      )
      return
    }

    if (!resumeFile && !useProfileResume) {
      toast.error(
        'Upload a resume or use your profile resume'
      )
      return
    }

    try {
      setAnalyzing(true)
      setResult(null)

      const formData = new FormData()
      formData.append(
        'job_description',
        jobDescription.trim()
      )
      formData.append(
        'use_profile_resume',
        useProfileResume ? 'true' : 'false'
      )

      if (resumeFile) {
        formData.append('resume', resumeFile)
      }

      const response =
        await auth.analyzeResume(formData)

      setResult(response.data)
      setLastScore(response.data.score)

      toast.success(
        `ATS analysis complete — score ${response.data.score}%`
      )
    } catch (error) {
      const message =
        error.response?.data?.error ||
        'Failed to analyze resume'

      toast.error(message)
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 65) return 'text-brand-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreRing = (score) => {
    if (score >= 80) return 'border-emerald-500'
    if (score >= 65) return 'border-brand-500'
    if (score >= 50) return 'border-amber-500'
    return 'border-red-500'
  }

  const priorityStyles = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-slate-200 bg-slate-50',
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          ATS Resume Analyzer
        </h1>
        <p className="text-slate-600 max-w-2xl">
          Upload your resume and paste a job description.
          Get an ATS-style match score and tailored
          suggestions to improve your chances.
        </p>

        {lastScore != null && (
          <p className="text-sm text-slate-500 mt-3">
            Last saved score:{' '}
            <span className="font-semibold text-brand-600">
              {lastScore}%
            </span>
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleAnalyze}
          className="rounded-3xl border border-slate-200 bg-white p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Resume file
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              disabled={useProfileResume}
              onChange={(e) => {
                setResumeFile(
                  e.target.files?.[0] || null
                )
              }}
              className="w-full p-4 rounded-2xl border border-slate-300 disabled:bg-slate-100"
            />
            <p className="text-xs text-slate-500 mt-2">
              PDF or DOCX (text-based, not scanned images)
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useProfileResume}
              onChange={(e) => {
                setUseProfileResume(
                  e.target.checked
                )
                if (e.target.checked) {
                  setResumeFile(null)
                }
              }}
              className="w-4 h-4 rounded border-slate-300 text-brand-600"
            />
            <span className="text-sm text-slate-700">
              Use resume from my Profile instead
            </span>
          </label>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job description *
            </label>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the full job description here — include required skills, responsibilities, and qualifications..."
              className="w-full p-4 rounded-2xl border border-slate-300 focus:border-brand-500 focus:outline-none resize-y min-h-[200px]"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              {jobDescription.trim().length} / 50 min characters
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Icons.Sparkles className="w-4 h-4" />
                Analyze for this job
              </>
            )}
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {!result && !analyzing && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Icons.Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                Your ATS report will appear here
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Keyword match, section checks, and
                improvement tips
              </p>
            </div>
          )}

          {analyzing && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">
                Reading resume and comparing to job
                description...
              </p>
            </div>
          )}

          {result && (
            <>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                <div
                  className={`mx-auto w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center ${getScoreRing(result.score)}`}
                >
                  <span
                    className={`text-4xl font-black ${getScoreColor(result.score)}`}
                  >
                    {result.score}%
                  </span>
                  <span className="text-sm text-slate-500 mt-1">
                    ATS score
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-4">
                  {result.grade}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {result.word_count} words detected
                  {result.resume_source === 'profile'
                    ? ' · from profile resume'
                    : ' · from upload'}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Score breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    result.breakdown || {}
                  ).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {value}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                          style={{
                            width: `${value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Keywords
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Matched ({result.matched_keywords?.length || 0})
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(result.matched_keywords || []).length > 0 ? (
                    result.matched_keywords.map((kw) => (
                      <Badge key={kw} variant="success">
                        {kw}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      None yet
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Missing ({result.missing_keywords?.length || 0})
                </p>
                <div className="flex flex-wrap gap-2">
                  {(result.missing_keywords || []).map((kw) => (
                    <Badge key={kw} variant="warning">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Suggestions
                </h3>
                <div className="space-y-3">
                  {(result.suggestions || []).map(
                    (item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl border ${priorityStyles[item.priority] || priorityStyles.medium}`}
                      >
                        <p className="text-sm font-semibold text-slate-800 capitalize mb-1">
                          {item.type} · {item.priority}
                        </p>
                        <p className="text-sm text-slate-700">
                          {item.message}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
