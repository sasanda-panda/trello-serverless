import Auth, { CognitoUser } from '@aws-amplify/auth'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import styles from '../styles/Profile.module.scss'

type AuthenticatedUserType = {
  email: string,
  email_verified: boolean
}

const Profile: NextPage = () => {

  // 

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType>({ email: '', email_verified: false })
  const [authenticationScene, setAuthenticationScene] = useState<'signUp'|'confirmSignUp'|'signIn'>('signIn')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [code, setCode] = useState<string>('')

  // 

  const fetchUser = async () => {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser()
      setIsAuthenticated(true)
      setAuthenticatedUser({ email: authenticatedUser.attributes.email, email_verified: authenticatedUser.attributes.email_verified })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  // 

  const router = useRouter()

  // 

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
      router.reload()
    } catch (err) {
      console.log(err)
    }
  }

  // 

  return isAuthenticated ? (
    <div>
      <p>Profile - authenticated</p>
      <div>
        <div>
          <dl>
            <dt>Email</dt>
            <dd>{authenticatedUser.email}</dd>
          </dl>
          <dl>
            <dt>Verification Status</dt>
            <dd>{authenticatedUser.email_verified ? 'Verified' : 'Not Verified'}</dd>
          </dl>
        </div>
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
                <div>
                  <div>
                    <input type="text" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                  </div>
                  <div>
                    <input type="password" value={password} onChange={(eve) => setPassword(eve.target.value)} />
                  </div>
                  <button onClick={() => signUp()}>signUp</button>
                  <button onClick={() => setAuthenticationScene('signIn')}>switch to signIn</button>
                </div>
              )
            case 'confirmSignUp':
              return (
                <div>
                  <div>
                    <input type="text" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                  </div>
                  <div>
                    <input type="text" value={code} onChange={(eve) => setCode(eve.target.value)} />
                  </div>
                  <button onClick={() => confirmSignUp()}>confirmSignUp</button>
                  <button onClick={() => resendSignUp()}>resendSignUp</button>
                </div>
              )
            default:
              return (
                <div>
                  <div>
                    <input type="text" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                  </div>
                  <div>
                    <input type="password" value={password} onChange={(eve) => setPassword(eve.target.value)} />
                  </div>
                  <button onClick={() => signIn()}>signIn</button>
                  <button onClick={() => setAuthenticationScene('signUp')}>switch to signUp</button>
                </div>
              )
          }
        })()}
      </div>
    </div>
  )
}

export default Profile
