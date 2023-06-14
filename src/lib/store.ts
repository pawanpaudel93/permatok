import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type LogInReturnProps } from 'othent'

interface AppPerisistState {
  isAuthenticated: boolean
  userData: null | LogInReturnProps
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setUserData: (userData: null | LogInReturnProps) => void
}

interface AppState {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
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

export const useStore = create<AppState>((set, get) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading })
}))
