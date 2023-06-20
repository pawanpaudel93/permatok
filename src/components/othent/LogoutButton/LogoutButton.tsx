import React from 'react'
import './LogoutButton.css'
import { type LogOutReturnProps } from 'othent'
import { getOthent } from '@/lib/utils'
import { useStore } from '@/lib/store'

export interface LogoutButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode | string
  onLogout?: (logoutResponse: LogOutReturnProps) => void
  apiid: string
}

const LogoutButton = (props: LogoutButtonProps) => {
  const { children = 'Sign Out', onLogout, apiid } = props

  const { isLoading, setIsLoading } = useStore()

  const logout = async () => {
    setIsLoading(true)
    try {
      const othent = await getOthent(apiid)
      const logoutResponse = await othent.logOut()
      if (onLogout) onLogout(logoutResponse)
    } catch (e) {
      console.log(`othent.logout() failed:`)
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className="othent-button-logout"
      disabled={isLoading}
      onClick={() => void logout()}
      {...props}
    >
      {children}
    </button>
  )
}

export default LogoutButton
