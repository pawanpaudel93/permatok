import React from 'react'
import './LoginButton.css'
import Logo from '../Logo'
import { type LogInReturnProps } from 'othent'
import { getOthent } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { Hide, Show, Spinner } from '@chakra-ui/react'

export interface LoginButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  onLogin?: (userData: LogInReturnProps) => void
  apiid: string
}

const LoginButton = (props: LoginButtonProps) => {
  const { isLoading, setIsLoading } = useStore()
  const { children, onLogin, apiid } = props

  const login = async () => {
    setIsLoading(true)
    try {
      const othent = await getOthent(apiid)
      const loginResponse = await othent.logIn()
      if (onLogin) onLogin(loginResponse)
    } catch (e) {
      console.log(`othent.login() failed:`)
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className="othent-button-login"
      disabled={isLoading}
      onClick={() => void login()}
      {...props}
    >
      {isLoading ? (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="md"
          mr={2.5}
        />
      ) : (
        <Logo />
      )}
      {children ? (
        children
      ) : (
        <>
          <Hide below="sm">
            Sign in with&nbsp;
            <span className="othent-button-login-brandname">Google</span>
          </Hide>
          <Show below="sm">Sign in</Show>
        </>
      )}
    </button>
  )
}

export default LoginButton
