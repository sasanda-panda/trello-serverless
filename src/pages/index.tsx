import Auth from '@aws-amplify/auth'
import API, { graphqlOperation, GraphQLResult } from '@aws-amplify/api'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { listProjects } from '../graphql/queries'
import { createProject, updateProject, deleteProject } from '../graphql/mutations'
import { onCreateProject, onUpdateProject, onDeleteProject } from '../graphql/subscriptions'
import styles from '../styles/Home.module.scss'

type AuthenticatedUserType = {
  email: string,
  email_verified: boolean
}

type ProjectType = {
  owner: string,
  id: string,
  name: string,
  content?: string,
  boards: any[]
}

const Home: NextPage = () => {

  // ログインしているかを判定
  // true:  listProjectsを実行
  // false: /profile/へ遷移

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType>({ email: '', email_verified: false })
  const [name, setName] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [projects, setProjects] = useState<ProjectType[]>([])

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

  const fetchData = async () => {
    try {
      const data = await API.graphql(graphqlOperation(listProjects))
      setProjects(data.data.listProjects.items)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchData()
  }, [])

  // 

  const router = useRouter()

  // 

  const createItem = async () => {
    try {
      const id = Math.floor(Math.random() * 999999999999)
      const withData = { input: { id, name, content } }
      await API.graphql(graphqlOperation(createProject, withData))
      setName('')
      setContent('')
    } catch (err) {
      console.log(err)
    }
  }

  const updateItem = async () => {
    try {

    } catch (err) {
      console.log(err)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const withData = { input: { id }}
      await API.graphql(graphqlOperation(deleteProject, withData))
    } catch (err) {
      console.log(err)
    }
  }

  // 

  return isAuthenticated ? (
    <div>
      <ul className={styles.projects}>
        {projects.map((project) => (
          <li key={project.id} className={styles.project}>
            <Link href={`/project/${project.id}`}>
              <div className={styles.project_head}>
                <div className={styles.project_head_name}>{project.name}</div>
                <div className={styles.project_head_content}>{project.content}</div>
              </div>
            </Link>
            <div className={styles.project_body}>
            <button onClick={() => deleteItem(project.id)}>deleteItem</button>
            </div>
          </li>
        ))}
        <li className={styles.project}>
          <div>
            <input type="text" value={name} onChange={(eve) => setName(eve.target.value)} />
          </div>
          <div>
            <input type="text" value={content} onChange={(eve) => setContent(eve.target.value)} />
          </div>
          <button onClick={() => createItem()}>createItem</button>
        </li>
      </ul>
    </div>
  ) : (
    <div>
      <div>Home - not authenticated</div>
      <div>go profile</div>
    </div>
  )
}

export default Home
