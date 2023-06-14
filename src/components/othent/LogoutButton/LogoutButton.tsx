import React, { useState } from 'react'
import './LogoutButton.css'
import { type LogOutReturnProps } from 'othent'
import { getOthent } from '@/lib/utils'

export interface LogoutButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode | string
  onLogout?: (logoutResponse: LogOutReturnProps) => void
  apiid: string
}

const LogoutButton = (props: LogoutButtonProps) => {
  const { children = 'Log Out', onLogout, apiid } = props

  const [clicked, setClicked] = useState(false)

  const logout = async () => {
    setClicked(true)
    try {
      const othent = await getOthent(apiid)
      const logoutResponse = await othent.logOut()
      if (onLogout) onLogout(logoutResponse)
    } catch (e) {
      console.log(`othent.logout() failed:`)
      console.log(e)
    } finally {
      setClicked(false)
    }
  }

  return (
    <button
      className="othent-button-logout"
      disabled={clicked}
      onClick={() => void logout()}
      {...props}
    >
      {children}
    </button>
  )
}

export default LogoutButton
