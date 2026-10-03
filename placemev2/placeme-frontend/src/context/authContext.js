import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)

        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('launchpad-auth')
        localStorage.removeItem('placeme-auth')

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: {
            ...state.user,
            ...userData,
          },
        }))
      },

      setToken: (token) => {
        localStorage.setItem('access_token', token)

        set({
          token,
          isAuthenticated: !!token,
        })
      },

      setRefreshToken: (refreshToken) => {
        localStorage.setItem('refresh_token', refreshToken)

        set({
          refreshToken,
        })
      },

      hydrateAuth: () => {
        const token =
          localStorage.getItem('access_token')

        const refreshToken =
          localStorage.getItem('refresh_token')

        if (token) {
          set({
            token,
            refreshToken,
            isAuthenticated: true,
          })
        }
      },
    }),
    {
      name: 'launchpad-auth',

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)