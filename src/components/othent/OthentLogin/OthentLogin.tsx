import React from 'react'
import './OthentLogin.css'
import Avatar from '../Avatar'
import LoginButton from '../LoginButton'
import LogoutButton from '../LogoutButton'
import UserInfo from '../UserInfo'
import Modal from '../Modal'
import { ModalLocation } from '../Modal/Modal'
import { type LogOutReturnProps, type LogInReturnProps } from 'othent'
import { usePersistStore } from '@/lib/store'

export interface OthentLoginProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  location?: ModalLocation
  apiid: string
}

const OthentLogin = (props: OthentLoginProps) => {
  const { children, location = ModalLocation.bottom, apiid } = props

  const { userData, setUserData, setIsAuthenticated } = usePersistStore()

  const onLogin = (userData: LogInReturnProps) => {
    setUserData(userData)
    setIsAuthenticated(true)
  }

  const onLogout = (logoutResponse: LogOutReturnProps) => {
    if (logoutResponse.response) {
      setUserData(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <div className="othent-login">
      {userData === null ? (
        <LoginButton onLogin={onLogin} apiid={apiid} />
      ) : (
        <Modal
          location={location}
          parent={
            children ? (
              children
            ) : (
              <Avatar username={userData.name} src={userData.picture} />
            )
          }
        >
          <div className="othent-login othent-login-modal-children">
            <UserInfo userdata={userData} />
            <LogoutButton onLogout={onLogout} apiid={apiid} />
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OthentLogin
