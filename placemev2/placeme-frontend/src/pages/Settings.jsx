import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import * as Icons from 'lucide-react'

import { Button } from '../components/Button'

import { auth } from '../services/apiClient'

export const Settings = () => {

  // ============================================
  // PROFILE STATE
  // ============================================

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [passwordSaving,
    setPasswordSaving] =
      useState(false)

  const [userData, setUserData] =
    useState({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      role: '',
    })

  // ============================================
  // PASSWORD STATE
  // ============================================

  const [passwordData,
    setPasswordData] =
      useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })

  // ============================================
  // FETCH PROFILE
  // ============================================

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {

    try {

      setLoading(true)

      const response =
        await auth.getProfile()

      setUserData(
        response.data
      )

    } catch (error) {

      console.error(
        'Error fetching profile:',
        error
      )

    } finally {

      setLoading(false)
    }
  }

  // ============================================
  // HANDLE PROFILE CHANGE
  // ============================================

  const handleChange = (e) => {

    const { name, value } =
      e.target

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ============================================
  // HANDLE PASSWORD CHANGE
  // ============================================

  const handlePasswordChange =
    (e) => {

      const { name, value } =
        e.target

      setPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

  // ============================================
  // SAVE PROFILE
  // ============================================

  const handleSave = async () => {

    try {

      setSaving(true)

      await auth.updateProfile(
        userData
      )

      alert(
        'Profile updated successfully 😎🔥'
      )

    } catch (error) {

      console.error(
        'Error updating profile:',
        error.response?.data ||
        error
      )

      alert(
        'Failed to update profile'
      )

    } finally {

      setSaving(false)
    }
  }

  // ============================================
  // CHANGE PASSWORD
  // ============================================

  const handlePasswordSave =
    async () => {

      try {

        if (
          !passwordData.current_password ||
          !passwordData.new_password ||
          !passwordData.confirm_password
        ) {

          alert(
            'Please fill all password fields'
          )

          return
        }

        if (
          passwordData.new_password
          !==
          passwordData.confirm_password
        ) {

          alert(
            'New passwords do not match'
          )

          return
        }

        setPasswordSaving(true)

        await auth.changePassword(
          passwordData
        )

        alert(
          'Password changed successfully 😎🔥'
        )

        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        })

      } catch (error) {

        console.error(
          'Error changing password:',
          error.response?.data ||
          error
        )

        alert(
          error.response?.data
            ?.current_password
          ||
          'Failed to change password'
        )

      } finally {

        setPasswordSaving(false)
      }
    }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-screen">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Loading settings...
          </p>

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">

      {/* HEADER */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <h1 className="text-4xl font-bold text-slate-900 mb-2">

          Settings
        </h1>

        <p className="text-slate-600">
          Manage your account settings
        </p>

      </motion.div>

      {/* PROFILE SETTINGS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8">

        <div className="flex items-center gap-4 mb-8">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">

            <Icons.User className="w-7 h-7 text-white" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-slate-900">

              Account Settings

            </h2>

            <p className="text-slate-600">
              Update your profile
            </p>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <input
            type="text"
            name="first_name"
            value={userData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="text"
            name="last_name"
            value={userData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

        <div className="flex justify-end mt-6">

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >

            {saving ? (
              <>
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icons.Save className="w-4 h-4" />
                Save Profile
              </>
            )}

          </Button>
        </div>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8">

        <div className="flex items-center gap-4 mb-8">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">

            <Icons.Lock className="w-7 h-7 text-white" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-slate-900">

              Change Password

            </h2>

            <p className="text-slate-600">
              Secure your account
            </p>

          </div>
        </div>

        <div className="space-y-4">

          <input
            type="password"
            name="current_password"
            value={
              passwordData.current_password
            }
            onChange={
              handlePasswordChange
            }
            placeholder="Current Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="password"
            name="new_password"
            value={
              passwordData.new_password
            }
            onChange={
              handlePasswordChange
            }
            placeholder="New Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="password"
            name="confirm_password"
            value={
              passwordData.confirm_password
            }
            onChange={
              handlePasswordChange
            }
            placeholder="Confirm New Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

        <div className="flex justify-end mt-6">

          <Button
            variant="danger"
            onClick={
              handlePasswordSave
            }
            disabled={
              passwordSaving
            }
          >

            {passwordSaving ? (
              <>
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Icons.Lock className="w-4 h-4" />
                Change Password
              </>
            )}

          </Button>
        </div>
      </div>
    </div>
  )
}