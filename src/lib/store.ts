import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type LogInReturnProps } from 'othent'

interface AppPerisistState {
  isAuthenticated: boolean
  userData: null | LogInReturnProps
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setUserData: (userData: null | LogInReturnProps) => void
}

export const usePersistStore = create(
  persist<AppPerisistState>(
    (set, get) => ({
      isAuthenticated: false,
      userData: null,
      setIsAuthenticated: (isAuthenticated: boolean) =>
        set({ isAuthenticated }),
      setUserData: (userData: null | LogInReturnProps) => set({ userData })
    }),
    {
      name: 'permatok.store'
    }
  )
)
