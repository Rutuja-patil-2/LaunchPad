import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import * as Icons from 'lucide-react'

import { toast } from 'react-toastify'

import { Button } from '../components/Button'

import { Badge } from '../components/Badge'

import {
  auth,
  career,
  resolveMediaUrl,
  getResumeFileName,
} from '../services/apiClient'

const EMPTY_PROJECT_FORM = {
  title: '',
  description: '',
  tech_stack: '',
  github_url: '',
  live_url: '',
  featured: false,
}

export const Profile = () => {

  // ============================================
  // STATES
  // ============================================

  const [user, setUser] =
    useState(null)

  const [profile, setProfile] =
    useState(null)

  const [projects, setProjects] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [showEditModal,
    setShowEditModal] =
      useState(false)

  const [showProjectModal,
    setShowProjectModal] =
      useState(false)

  const [editingProjectId,
    setEditingProjectId] =
      useState(null)

  const [projectForm, setProjectForm] =
    useState(EMPTY_PROJECT_FORM)

  const [savingProject, setSavingProject] =
    useState(false)

  // ============================================
  // FORM DATA
  // ============================================

  const [formData, setFormData] =
    useState({

      headline: '',

      about: '',

      location: '',

      branch: '',

      graduation_year: '',

      cgpa: '',

      backlogs: 0,

      skills: '',

      github_url: '',

      linkedin_url: '',

      portfolio_url: '',

      leetcode_url: '',

      resume: null,
    })

  const [resumeFile, setResumeFile] =
    useState(null)

  const [profilePictureFile,
    setProfilePictureFile] =
    useState(null)

  const [profilePicturePreview,
    setProfilePicturePreview] =
    useState(null)

  // ============================================
  // FETCH DATA
  // ============================================

  useEffect(() => {
    fetchData()
  }, [])

  const applyProfileData = (
    profileData
  ) => {
    setProfile(profileData)

    setProjects(
      profileData.projects || []
    )

    setFormData({
      headline:
        profileData.headline || '',
      about:
        profileData.about || '',
      location:
        profileData.location || '',
      branch:
        profileData.branch || '',
      graduation_year:
        profileData.graduation_year || '',
      cgpa:
        profileData.cgpa || '',
      backlogs:
        profileData.backlogs || 0,
      skills:
        profileData.skills || '',
      github_url:
        profileData.github_url || '',
      linkedin_url:
        profileData.linkedin_url || '',
      portfolio_url:
        profileData.portfolio_url || '',
      leetcode_url:
        profileData.leetcode_url || '',
      resume:
        profileData.resume || null,
    })
  }

  const refreshProfile = async () => {
    const profileResponse =
      await career.getMyProfile()

    applyProfileData(
      profileResponse.data
    )

    return profileResponse.data
  }

  const fetchData = async () => {

    try {

      setLoading(true)

      const userResponse =
        await auth.getProfile()

      setUser(
        userResponse.data
      )

      await refreshProfile()

    } catch (error) {

      console.error(
        'Failed to fetch profile:',
        error
      )

      toast.error(
        'Failed to load profile'
      )

    } finally {

      setLoading(false)
    }
  }

  // ============================================
  // PROFILE COMPLETION
  // ============================================

  const calculateCompletion = () => {

    if (!profile) return 0

    let score = 0

    // Required fields (20 points each)
    if (profile.branch) score += 20

    if (profile.cgpa) score += 20

    if (profile.skills) score += 20

    // Important fields (10 points each)
    if (profile.headline) score += 10

    if (profile.about) score += 10

    if (profile.resume) score += 10

    // Optional (bonus)
    if (projects.length > 0) score += 5

    if (profile.github_url) score += 2

    if (profile.linkedin_url) score += 2

    if (profile.portfolio_url) score += 1

    if (profile.leetcode_url) score += 1

    return Math.min(score, 100)
  }

  const completion =
    profile?.profile_completion ??
    calculateCompletion()

  const isPlacementReady = () => {
    return (
      profile?.branch &&
      profile?.cgpa &&
      profile?.skills &&
      completion >= 70
    )
  }

  // ============================================
  // UPDATE PROFILE
  // ============================================

  const buildProfilePayload = () => {
    const payload = {
      headline: formData.headline || '',
      about: formData.about || '',
      location: formData.location || '',
      branch: formData.branch || '',
      skills: formData.skills || '',
      github_url: formData.github_url || '',
      linkedin_url: formData.linkedin_url || '',
      portfolio_url: formData.portfolio_url || '',
      leetcode_url: formData.leetcode_url || '',
    }

    if (formData.graduation_year) {
      payload.graduation_year = Number(
        formData.graduation_year
      )
    }

    if (formData.cgpa) {
      payload.cgpa = formData.cgpa
    }

    if (
      formData.backlogs !== '' &&
      formData.backlogs != null
    ) {
      payload.backlogs = Number(
        formData.backlogs
      )
    }

    if (resumeFile || profilePictureFile) {
      const multipart = new FormData()
      Object.entries(payload).forEach(
        ([key, value]) => {
          multipart.append(key, value)
        }
      )

      if (resumeFile) {
        multipart.append(
          'resume',
          resumeFile
        )
      }

      if (profilePictureFile) {
        multipart.append(
          'profile_picture',
          profilePictureFile
        )
      }

      return multipart
    }

    return payload
  }

  const handleUpdateProfile =
    async (e) => {

      e.preventDefault()

      try {

        setSaving(true)

        await career.updateMyProfile(
          buildProfilePayload()
        )

        await refreshProfile()

        setResumeFile(null)
        setProfilePictureFile(null)

        if (profilePicturePreview) {
          URL.revokeObjectURL(
            profilePicturePreview
          )
        }

        setProfilePicturePreview(null)
        setShowEditModal(false)

        toast.success(
          'Career profile saved'
        )

      } catch (error) {

        console.error(
          'Failed to update profile:',
          error
        )

        const detail =
          error.response?.data

        toast.error(
          detail
            ? `Could not save profile: ${JSON.stringify(detail)}`
            : 'Could not save profile. Please try again.'
        )

      } finally {

        setSaving(false)
      }
    }

  // ============================================
  // PROJECTS
  // ============================================

  const openAddProject = () => {
    setEditingProjectId(null)
    setProjectForm(EMPTY_PROJECT_FORM)
    setShowProjectModal(true)
  }

  const openEditProject = (
    project
  ) => {
    setEditingProjectId(project.id)
    setProjectForm({
      title: project.title || '',
      description:
        project.description || '',
      tech_stack:
        project.tech_stack || '',
      github_url:
        project.github_url || '',
      live_url:
        project.live_url || '',
      featured: Boolean(
        project.featured
      ),
    })
    setShowProjectModal(true)
  }

  const handleSaveProject = async (
    e
  ) => {
    e.preventDefault()

    try {
      setSavingProject(true)

      const payload = {
        title: projectForm.title.trim(),
        description:
          projectForm.description.trim(),
        tech_stack:
          projectForm.tech_stack.trim(),
        github_url:
          projectForm.github_url.trim(),
        live_url:
          projectForm.live_url.trim(),
        featured:
          projectForm.featured,
      }

      if (editingProjectId) {
        await career.updateProject(
          editingProjectId,
          payload
        )
        toast.success(
          'Project updated'
        )
      } else {
        await career.createProject(
          payload
        )
        toast.success(
          'Project added'
        )
      }

      await refreshProfile()
      setShowProjectModal(false)

    } catch (error) {
      console.error(
        'Failed to save project:',
        error
      )

      const detail =
        error.response?.data

      toast.error(
        detail
          ? `Could not save project: ${JSON.stringify(detail)}`
          : 'Could not save project'
      )
    } finally {
      setSavingProject(false)
    }
  }

  const handleDeleteProject = async (
    projectId
  ) => {
    if (
      !window.confirm(
        'Delete this project?'
      )
    ) {
      return
    }

    try {
      await career.deleteProject(
        projectId
      )
      await refreshProfile()
      toast.success(
        'Project deleted'
      )
    } catch (error) {
      console.error(
        'Failed to delete project:',
        error
      )
      toast.error(
        'Could not delete project'
      )
    }
  }

  // ============================================
  // AVATAR
  // ============================================

  const defaultAvatar =
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${
      user?.username || 'user'
    }`

  const displayAvatar =
    profilePicturePreview ||
    resolveMediaUrl(
      profile?.profile_picture
    ) ||
    defaultAvatar

  const resumeUrl = resolveMediaUrl(
    profile?.resume
  )

  const resumeFileName = getResumeFileName(
    profile?.resume
  )

  const handleProfilePictureChange = (
    e
  ) => {
    const file =
      e.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error(
        'Please choose an image file'
      )
      return
    }

    if (profilePicturePreview) {
      URL.revokeObjectURL(
        profilePicturePreview
      )
    }

    setProfilePictureFile(file)
    setProfilePicturePreview(
      URL.createObjectURL(file)
    )
  }

  const fullName =
    user?.first_name ||
    user?.last_name
      ? `${user?.first_name || ''} ${
          user?.last_name || ''
        }`
      : user?.username

  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (
      <div className="
        flex items-center justify-center
        py-24
      ">

        <div className="
          w-14 h-14 border-4
          border-slate-200
          border-t-brand-600
          rounded-full animate-spin
        " />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* HERO */}
      <motion.div

        initial={{
          opacity: 0,
          y: 20
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        className="
          relative overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-brand-600
          via-purple-600
          to-pink-600
          p-8 text-white
        "
      >

        {/* GLOW */}
        <div className="
          absolute -top-20 -right-20
          h-72 w-72 rounded-full
          bg-white/10 blur-3xl
        " />

        <div className="
          relative z-10
          flex flex-col lg:flex-row
          gap-8 items-start
        ">

          {/* AVATAR */}
          <div className="relative group">

            <img
              src={displayAvatar}
              alt={fullName}
              className="
                w-32 h-32 rounded-full
                border-4 border-white/30
                shadow-2xl object-cover
                bg-white/20
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowEditModal(true)
              }
              className="
                absolute inset-0 flex
                items-center justify-center
                rounded-full bg-black/40
                opacity-0 group-hover:opacity-100
                transition-opacity
              "
              aria-label="Change profile photo"
            >
              <Icons.Camera className="
                w-8 h-8 text-white
              " />
            </button>

            <div className="
              absolute bottom-2 right-2
              w-6 h-6 rounded-full
              bg-green-400 border-4
              border-white
            " />
          </div>

          {/* INFO */}
          <div className="flex-1">

            <div className="
              flex flex-col lg:flex-row
              lg:items-start
              lg:justify-between
              gap-4
            ">

              <div>

                <h1 className="
                  text-5xl font-black
                ">
                  {fullName}
                </h1>

                <p className="
                  text-xl text-white/80
                  mt-3
                ">
                  {profile?.headline ||
                    'Add your professional headline'}
                </p>

                <div className="
                  flex flex-wrap gap-3
                  mt-5
                ">

                  <Badge variant="secondary">
                    {profile?.branch ||
                      'Branch'}
                  </Badge>

                  <Badge variant="secondary">
                    CGPA:
                    {' '}
                    {profile?.cgpa ||
                      'N/A'}
                  </Badge>

                  <Badge variant="secondary">
                    {projects.length}
                    {' '}
                    Projects
                  </Badge>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() =>
                  setShowEditModal(true)
                }
              >

                <Icons.Edit className="
                  w-4 h-4
                " />

                Edit Profile
              </Button>
            </div>

            {/* COMPLETION */}
            <div className="mt-8">

              <div className="
                flex items-center
                justify-between mb-3
              ">

                <p className="
                  text-sm font-semibold
                ">
                  Profile Completion
                </p>

                <p className="
                  text-sm font-bold
                ">
                  {completion}%
                </p>
              </div>

              <div className="
                h-3 rounded-full
                bg-white/20 overflow-hidden
              ">

                <motion.div

                  initial={{
                    width: 0
                  }}

                  animate={{
                    width:
                      `${completion}%`
                  }}

                  transition={{
                    duration: 1
                  }}

                  className={`h-full rounded-full ${
                    completion >= 70
                      ? 'bg-emerald-400'
                      : 'bg-white'
                  }`}
                />
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-2">
                {completion >= 70 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                    <Icons.CheckCircle2 className="w-4 h-4" />
                    Ready for Placements
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold">
                    <Icons.AlertCircle className="w-4 h-4" />
                    {70 - completion}% more needed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="
        grid grid-cols-1 lg:grid-cols-3
        gap-8
      ">

        {/* LEFT */}
        <div className="
          lg:col-span-2 space-y-8
        ">

          {/* ABOUT */}
          <div className="
            rounded-3xl border
            border-slate-200
            bg-white p-8
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <Icons.User className="
                w-6 h-6 text-brand-600
              " />

              <h2 className="
                text-2xl font-bold
              ">
                About
              </h2>
            </div>

            <p className="
              text-slate-600 leading-relaxed
            ">
              {profile?.about ||
                'Add your bio and career interests'}
            </p>
          </div>

          {/* RESUME */}
          <div className="
            rounded-3xl border
            border-slate-200
            bg-white p-8
          ">
            <div className="
              flex items-center gap-3
              mb-6
            ">
              <Icons.FileText className="
                w-6 h-6 text-brand-600
              " />

              <h2 className="
                text-2xl font-bold
              ">
                Resume
              </h2>
            </div>

            {resumeUrl ? (
              <div className="
                flex flex-col sm:flex-row
                sm:items-center
                sm:justify-between gap-4
                rounded-2xl border
                border-slate-200 bg-slate-50
                p-5
              ">
                <div className="flex items-center gap-4">
                  <div className="
                    flex h-14 w-14 items-center
                    justify-center rounded-2xl
                    bg-brand-100 text-brand-600
                  ">
                    <Icons.FileText className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="
                      font-semibold text-slate-900
                    ">
                      {resumeFileName}
                    </p>
                    <p className="
                      text-sm text-slate-500 mt-1
                    ">
                      Your uploaded resume is ready
                      for placement applications
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="primary">
                      <Icons.ExternalLink className="w-4 h-4" />
                      View resume
                    </Button>
                  </a>

                  <a
                    href={resumeUrl}
                    download={resumeFileName}
                  >
                    <Button variant="secondary">
                      <Icons.Download className="w-4 h-4" />
                      Download
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="
                rounded-2xl border border-dashed
                border-slate-300 bg-slate-50
                p-8 text-center
              ">
                <Icons.FileText className="
                  w-10 h-10 text-slate-400
                  mx-auto mb-3
                " />
                <p className="text-slate-600">
                  No resume uploaded yet
                </p>
                <p className="
                  text-sm text-slate-500 mt-2
                ">
                  Upload a PDF in Edit Profile to
                  complete your placement profile
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    setShowEditModal(true)
                  }
                >
                  Upload resume
                </Button>
              </div>
            )}
          </div>

          {/* PROJECTS */}
          <div className="
            rounded-3xl border
            border-slate-200
            bg-white p-8
          ">

            <div className="
              flex items-center
              justify-between mb-6
            ">

              <div className="
                flex items-center gap-3
              ">

                <Icons.Code2 className="
                  w-6 h-6 text-brand-600
                " />

                <h2 className="
                  text-2xl font-bold
                ">
                  Projects
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="primary">
                  {projects.length}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={openAddProject}
                >
                  <Icons.Plus className="w-4 h-4" />
                  Add Project
                </Button>
              </div>
            </div>

            <div className="
              space-y-5
            ">

              {projects.length > 0 ? (

                projects.map((project) => (

                  <motion.div

                    key={project.id}

                    whileHover={{
                      y: -3
                    }}

                    className="
                      rounded-2xl border
                      border-slate-200
                      p-5 hover:shadow-lg
                      transition-all
                    "
                  >

                    <div className="
                      flex items-start
                      justify-between gap-4
                    ">

                      <div>

                        <h3 className="
                          text-xl font-bold
                          text-slate-900
                        ">
                          {project.title}
                        </h3>

                        <p className="
                          text-slate-600 mt-2
                        ">
                          {project.description}
                        </p>

                        <div className="
                          flex flex-wrap gap-2
                          mt-4
                        ">

                          {project.tech_stack
                            ?.split(',')
                            .map((tech, idx) => (

                              <Badge
                                key={idx}
                                variant="secondary"
                              >
                                {tech.trim()}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div className="
                        flex items-center gap-2
                      ">

                        {project.featured && (
                          <Badge variant="primary">
                            Featured
                          </Badge>
                        )}

                        {project.github_url && (
                          <a
                            href={
                              project.github_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="
                              p-2 rounded-lg
                              hover:bg-slate-100
                            "
                          >
                            <Icons.GitBranch className="
                              w-5 h-5
                              text-slate-600
                            " />
                          </a>
                        )}

                        {project.live_url && (
                          <a
                            href={
                              project.live_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="
                              p-2 rounded-lg
                              hover:bg-slate-100
                            "
                          >
                            <Icons.ExternalLink className="
                              w-5 h-5
                              text-slate-600
                            " />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            openEditProject(
                              project
                            )
                          }
                          className="
                            p-2 rounded-lg
                            hover:bg-brand-50
                            text-brand-600
                          "
                          aria-label="Edit project"
                        >
                          <Icons.Edit className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProject(
                              project.id
                            )
                          }
                          className="
                            p-2 rounded-lg
                            hover:bg-red-50
                            text-red-600
                          "
                          aria-label="Delete project"
                        >
                          <Icons.Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))

              ) : (

                <div className="
                  text-center py-10
                ">
                  <p className="text-slate-500 mb-4">
                    No projects added yet
                  </p>
                  <Button
                    variant="primary"
                    onClick={openAddProject}
                  >
                    <Icons.Plus className="w-4 h-4" />
                    Add your first project
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="
          space-y-8
        ">

          {/* SKILLS */}
          <div className="
            rounded-3xl border
            border-slate-200
            bg-white p-8
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <Icons.Sparkles className="
                w-6 h-6 text-brand-600
              " />

              <h2 className="
                text-2xl font-bold
              ">
                Skills
              </h2>
            </div>

            <div className="
              flex flex-wrap gap-3
            ">

              {profile?.skills ? (

                profile.skills
                  .split(',')
                  .map((skill, idx) => (

                    <Badge
                      key={idx}
                      variant="primary"
                    >
                      {skill.trim()}
                    </Badge>
                  ))

              ) : (

                <p className="
                  text-slate-500
                ">
                  No skills added
                </p>
              )}
            </div>
          </div>

          {/* LINKS */}
          <div className="
            rounded-3xl border
            border-slate-200
            bg-white p-8
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <Icons.Link className="
                w-6 h-6 text-brand-600
              " />

              <h2 className="
                text-2xl font-bold
              ">
                Social Links
              </h2>
            </div>

            <div className="
              space-y-4
            ">

              {profile?.github_url && (
                <a
                  href={
                    profile.github_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center gap-3
                    text-slate-700
                    hover:text-brand-600
                  "
                >

                  <Icons.GitBranch className="
                    w-5 h-5
                  " />

                  GitHub
                </a>
              )}

              {profile?.linkedin_url && (
                <a
                  href={
                    profile.linkedin_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center gap-3
                    text-slate-700
                    hover:text-brand-600
                  "
                >

                  <Icons.Link className="
                    w-5 h-5
                  " />

                  LinkedIn
                </a>
              )}

              {profile?.portfolio_url && (
                <a
                  href={
                    profile.portfolio_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center gap-3
                    text-slate-700
                    hover:text-brand-600
                  "
                >

                  <Icons.Globe className="
                    w-5 h-5
                  " />

                  Portfolio
                </a>
              )}

              {profile?.leetcode_url && (
                <a
                  href={
                    profile.leetcode_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center gap-3
                    text-slate-700
                    hover:text-brand-600
                  "
                >

                  <Icons.Code className="
                    w-5 h-5
                  " />

                  LeetCode
                </a>
              )}
            </div>
          </div>

          {/* READINESS */}
          <div className="
            rounded-3xl border
            border-brand-200
            bg-gradient-to-br
            from-brand-50
            to-purple-50
            p-8
          ">

            <div className="
              flex items-center gap-3
              mb-5
            ">

              <Icons.Zap className="
                w-6 h-6 text-brand-600
              " />

              <h2 className="
                text-2xl font-bold
              ">
                Placement Readiness
              </h2>
            </div>

            <div className="
              text-5xl font-black
              text-brand-600
            ">
              {completion}%
            </div>

            <p className="
              text-slate-600 mt-3
            ">
              Complete your profile
              to unlock better placement
              recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (

        <div className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/50 p-4
        ">

          <div className="
            w-full max-w-3xl
            rounded-3xl bg-white
            p-8 max-h-[90vh]
            overflow-y-auto
          ">

            <div className="
              flex items-center
              justify-between mb-8
            ">

              <h2 className="
                text-3xl font-bold
              ">
                Edit Career Profile
              </h2>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
              >

                <Icons.X className="
                  w-6 h-6
                " />
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateProfile
              }
              className="
                space-y-5
              "
            >

              {/* PROFILE PHOTO */}
              <div className="
                flex flex-col sm:flex-row
                items-center gap-6
                rounded-2xl border
                border-slate-200 bg-slate-50 p-5
              ">
                <img
                  src={
                    profilePicturePreview ||
                    resolveMediaUrl(
                      profile?.profile_picture
                    ) ||
                    defaultAvatar
                  }
                  alt="Profile preview"
                  className="
                    w-24 h-24 rounded-full
                    object-cover border-4
                    border-white shadow-md
                  "
                />

                <div className="flex-1 w-full">
                  <label className="
                    block text-sm font-semibold
                    text-slate-700 mb-2
                  ">
                    Profile photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleProfilePictureChange
                    }
                    className="
                      w-full p-3 rounded-2xl
                      border border-slate-300
                      bg-white
                    "
                  />
                  <p className="
                    text-xs text-slate-500 mt-2
                  ">
                    JPG, PNG, or WebP recommended
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Professional Headline"
                value={formData.headline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    headline:
                      e.target.value
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <textarea
                rows={4}
                placeholder="About You"
                value={formData.about}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    about:
                      e.target.value
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <div className="
                grid grid-cols-1
                md:grid-cols-2 gap-4
              ">

                <div>
                  <label className="
                    block text-sm font-semibold
                    text-slate-700 mb-2
                  ">
                    Branch <span className="
                      text-red-500
                    ">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="CSE, IT, ECE, etc."
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branch:
                          e.target.value
                      })
                    }
                    required
                    className="
                      w-full p-4 rounded-2xl
                      border border-slate-300
                      focus:border-brand-500
                      focus:outline-none
                    "
                  />
                </div>

                <input
                  type="number"
                  placeholder="Graduation Year"
                  value={
                    formData.graduation_year
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graduation_year:
                        e.target.value
                    })
                  }
                  className="
                    w-full p-4 rounded-2xl
                    border border-slate-300
                  "
                />

                <div>
                  <label className="
                    block text-sm font-semibold
                    text-slate-700 mb-2
                  ">
                    CGPA <span className="
                      text-red-500
                    ">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 8.5"
                    value={formData.cgpa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cgpa:
                          e.target.value
                      })
                    }
                    required
                    className="
                      w-full p-4 rounded-2xl
                      border border-slate-300
                      focus:border-brand-500
                      focus:outline-none
                    "
                  />
                </div>

                <input
                  type="number"
                  placeholder="Backlogs"
                  value={
                    formData.backlogs
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      backlogs:
                        e.target.value
                    })
                  }
                  className="
                    w-full p-4 rounded-2xl
                    border border-slate-300
                  "
                />
              </div>

              <div>
                <label className="
                  block text-sm font-semibold
                  text-slate-700 mb-2
                ">
                  Skills <span className="
                    text-red-500
                  ">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="React, Django, SQL (comma-separated)"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills:
                        e.target.value
                    })
                  }
                  required
                  className="
                    w-full p-4 rounded-2xl
                    border border-slate-300
                    focus:border-brand-500
                    focus:outline-none
                  "
                />
              </div>

              <input
                type="url"
                placeholder="GitHub URL"
                value={
                  formData.github_url
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    github_url:
                      e.target.value
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <input
                type="url"
                placeholder="LinkedIn URL"
                value={
                  formData.linkedin_url
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedin_url:
                      e.target.value
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <input
                type="url"
                placeholder="Portfolio URL"
                value={
                  formData.portfolio_url
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    portfolio_url:
                      e.target.value
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <input
                type="url"
                placeholder="LeetCode URL"
                value={
                  formData.leetcode_url
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leetcode_url:
                      e.target.value
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <div>
                <label className="
                  block text-sm font-semibold
                  text-slate-700 mb-2
                ">
                  Resume <span className="
                    text-red-500
                  ">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setResumeFile(file)
                      setFormData({
                        ...formData,
                        resume: file.name
                      })
                    }
                  }}
                  className="
                    w-full p-4 rounded-2xl
                    border border-slate-300
                    focus:border-brand-500
                    focus:outline-none
                  "
                />

                {resumeFile && (
                  <p className="
                    text-sm text-emerald-700 mt-2
                  ">
                    New file selected:
                    {' '}
                    {resumeFile.name}
                  </p>
                )}

                {!resumeFile && resumeUrl && (
                  <div className="
                    mt-3 flex flex-wrap items-center
                    gap-3 text-sm
                  ">
                    <span className="text-slate-600">
                      Current:
                      {' '}
                      {resumeFileName}
                    </span>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        font-semibold text-brand-600
                        hover:underline
                      "
                    >
                      View current resume
                    </a>
                  </div>
                )}
                <p className="
                  text-xs text-slate-500 mt-1
                ">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={saving || !formData.branch || !formData.cgpa || !formData.skills}
              >

                {saving
                  ? 'Saving...'
                  : 'Save Career Profile'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {showProjectModal && (
        <div className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/50 p-4
        ">
          <div className="
            w-full max-w-2xl
            rounded-3xl bg-white
            p-8 max-h-[90vh]
            overflow-y-auto
          ">
            <div className="
              flex items-center
              justify-between mb-8
            ">
              <h2 className="text-3xl font-bold">
                {editingProjectId
                  ? 'Edit Project'
                  : 'Add Project'}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowProjectModal(false)
                }
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProject}
              className="space-y-5"
            >
              <input
                type="text"
                placeholder="Project title *"
                value={projectForm.title}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    title: e.target.value,
                  })
                }
                required
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                  focus:border-brand-500
                  focus:outline-none
                "
              />

              <textarea
                rows={4}
                placeholder="Description *"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
                required
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                  focus:border-brand-500
                  focus:outline-none
                "
              />

              <input
                type="text"
                placeholder="Tech stack * (e.g. React, Django, PostgreSQL)"
                value={projectForm.tech_stack}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    tech_stack: e.target.value,
                  })
                }
                required
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                  focus:border-brand-500
                  focus:outline-none
                "
              />

              <input
                type="url"
                placeholder="GitHub URL (optional)"
                value={projectForm.github_url}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    github_url: e.target.value,
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <input
                type="url"
                placeholder="Live demo URL (optional)"
                value={projectForm.live_url}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    live_url: e.target.value,
                  })
                }
                className="
                  w-full p-4 rounded-2xl
                  border border-slate-300
                "
              />

              <label className="
                flex items-center gap-3
                text-slate-700 font-medium
              ">
                <input
                  type="checkbox"
                  checked={projectForm.featured}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      featured: e.target.checked,
                    })
                  }
                  className="
                    w-4 h-4 rounded
                    border-slate-300
                    text-brand-600
                  "
                />
                Mark as featured project
              </label>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={
                  savingProject ||
                  !projectForm.title.trim() ||
                  !projectForm.description.trim() ||
                  !projectForm.tech_stack.trim()
                }
              >
                {savingProject
                  ? 'Saving...'
                  : editingProjectId
                    ? 'Update Project'
                    : 'Add Project'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}