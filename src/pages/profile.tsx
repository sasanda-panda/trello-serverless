import Auth from '@aws-amplify/auth'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import styles from '../styles/Profile.module.scss'

type AuthenticatedUserType = {
  email: string,
  email_verified: boolean
}

const Profile: NextPage = () => {

  // ログインしているかを判定
  // true:  ユーザー情報を表示
  // false: フォームを表示

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType>({ email: '', email_verified: false })
  const [authenticationScene, setAuthenticationScene] = useState<'signUp'|'confirmSignUp'|'signIn'>('signIn')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [code, setCode] = useState<string>('')

  const fetchUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      setIsAuthenticated(true)
      setAuthenticatedUser({ email: user.attributes.email, email_verified: user.attibutes.email_verified })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const router = useRouter()

  const signUp = async () => {
    try {
      await Auth.signUp({
        username,
        password,
        attributes: { email: username }
      })
      setPassword('')
      setAuthenticationScene('confirmSignUp')
    } catch (err) {
      console.log(err)
    }
  }

  const confirmSignUp = async () => {
    try {
      await Auth.confirmSignUp(username, code)
      setAuthenticationScene('signIn')
    } catch (err) {
      console.log(err)
    }
  }

  const resendSignUp = async () => {
    try {
      await Auth.resendSignUp(username)
    } catch (err) {
      console.log(err)
    }
  }

  const signIn = async () => {
    try {
      await Auth.signIn(username, password)
      router.reload()
    } catch (err) {
      console.log(err)
    }
  }

  const signOut = async () => {
    try {
      await Auth.signOut()
    } catch (err) {
      console.log(err)
    }
  }

  return isAuthenticated ? (
    <div>
      <p>Profile - authenticated</p>
      <div>
        <button onClick={() => signOut()}>signOut</button>
      </div>
    </div>
  ) : (
    <div>
      <p>Profile - not authenticated</p>
      <div>
        {(() => {
          switch(authenticationScene) {
            case 'signUp':
              return (
                <div></div>
              )
            case 'confirmSignUp':
              return (
                <div></div>
              )
            default:
              return (
                <div></div>
              )
          }
        })}
      </div>
    </div>
  )
}

export default Profile
