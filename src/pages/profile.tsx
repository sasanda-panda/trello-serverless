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
      router.push('/')
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
    <div className={styles.profile}>
      <div className={styles.profile_head}>
        <dl>
          <dt>Email</dt>
          <dd>{authenticatedUser.email}</dd>
        </dl>
        <dl>
          <dt>Verification Status</dt>
          <dd>{authenticatedUser.email_verified ? 'Verified' : 'Not Verified'}</dd>
        </dl>
      </div>
      <div className={styles.profile_body}>
        <button onClick={() => signOut()}>signOut</button>
      </div>
    </div>
  ) : (
    <div className={styles.profile}>
      {(() => {
        switch(authenticationScene) {
          case 'signUp':
            return (
              <>
                <div className={styles.profile_head}>
                  <div>
                    <input type="text" placeholder="Email" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                  </div>
                  <div>
                    <input type="password" placeholder="Password" value={password} onChange={(eve) => setPassword(eve.target.value)} />
                  </div>
                </div>
                <div className={styles.profile_body}>
                  <button onClick={() => signUp()}>Sign up</button>
                  <button onClick={() => setAuthenticationScene('signIn')}>Sign in</button>
                </div>
              </>
            )
          case 'confirmSignUp':
            return (
              <>
                <div className={styles.profile_head}>
                  <div>
                    <input type="text" placeholder="Email" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                  </div>
                  <div>
                    <input type="text" placeholder="Code" value={code} onChange={(eve) => setCode(eve.target.value)} />
                  </div>
                </div>
                <div className={styles.profile_body}>
                  <button onClick={() => confirmSignUp()}>Confirm Sign up</button>
                  <button onClick={() => resendSignUp()}>Resend sign up</button>
                </div>
              </>
            )
          default:
            return (
              <>
                <div className={styles.profile_head}>
                  <div>
                    <input type="text" placeholder="Email" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                  </div>
                  <div>
                    <input type="password" placeholder="Password" value={password} onChange={(eve) => setPassword(eve.target.value)} />
                  </div>
                </div>
                <div className={styles.profile_body}>
                  <button onClick={() => signIn()}>Sign in</button>
                  <button onClick={() => setAuthenticationScene('signUp')}>Sign up</button>
                </div>
              </>
            )
        }
      })()}
    </div>
  )
}

export default Profile
