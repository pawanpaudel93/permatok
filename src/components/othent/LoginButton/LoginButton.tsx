import React, { useState } from 'react'
import './LoginButton.css'
import Logo from '../Logo'
import { type LogInReturnProps } from 'othent'
import { getOthent } from '@/lib/utils'

export interface LoginButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  onLogin?: (userData: LogInReturnProps) => void
  apiid: string
}

const LoginButton = (props: LoginButtonProps) => {
  const { children, onLogin, apiid } = props

  const [clicked, setClicked] = useState(false)

  const login = async () => {
    setClicked(true)
    try {
      const othent = await getOthent(apiid)
      const loginResponse = await othent.logIn()
      if (onLogin) onLogin(loginResponse)
    } catch (e) {
      console.log(`othent.login() failed:`)
      console.log(e)
    } finally {
      setClicked(false)
    }
  }

  return (
    <button
      className="othent-button-login"
      disabled={clicked}
      onClick={() => void login()}
      {...props}
    >
      <Logo />
      {children ? (
        children
      ) : (
        <>
          Sign in&nbsp;with&nbsp;
          <span className="othent-button-login-brandname">Google</span>
        </>
      )}
    </button>
  )
}

export default LoginButton
