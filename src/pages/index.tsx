import Auth from '@aws-amplify/auth'
import API, { graphqlOperation, GraphQLResult } from '@aws-amplify/api'
import { useEffect, useState } from 'react'
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { listProjects } from '../graphql/queries'
import { createProject, updateProject, deleteProject } from '../graphql/mutations'
import { onCreateProject, onUpdateProject, onDeleteProject } from '../graphql/subscriptions'
import styles from '../styles/Home.module.scss'
import Modal from '../components/organisms/Modal'

type AuthenticatedUserType = {
  username: string,
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

  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType>({ email: '', email_verified: false })
  const [targetProjectID, setTargetProjectID] = useState<string>('')
  const [isActiveCreateModal, setIsActiveCreateModal] = useState<boolean>(false)
  const [isActiveUpdateModal, setIsActiveUpdateModal] = useState<boolean>(false)
  const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [navigateSeconds, setNavigateSeconds] = useState<number>(3)

  const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds))

  const navigateToProfile = async () => {
    await wait(1000)
    setNavigateSeconds(2)
    await wait(1000)
    setNavigateSeconds(1)
    await wait(1000)
    router.push('/profile')
  }

  // 

  const fetchUser = async () => {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser()
      setIsAuthenticated(true)
      setAuthenticatedUser({ username: authenticatedUser.username, email: authenticatedUser.attributes.email, email_verified: authenticatedUser.attributes.email_verified })
    } catch (err) {
      setIsLoaded(true)
      navigateToProfile()
    }
  }

  const fetchData = async () => {
    try {
      const data = await API.graphql(graphqlOperation(listProjects))
      setProjects(data.data.listProjects.items.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()))
      setIsLoaded(true)
    } catch (err) {
      console.log(err)
    }
  }

  const attachSubscription = async () => {
    const createClient = API.graphql(graphqlOperation(onCreateProject, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in createClient) {
      createClient.subscribe({
        next: (result: any) => {
          setProjects((oldProjects) => {
            return [ result.value.data.onCreateProject, ...oldProjects ]
          })
        }
      });
    }
    const updateClient = API.graphql(graphqlOperation(onUpdateProject, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in updateClient) {
      updateClient.subscribe({
        next: (result: any) => {
          setProjects((oldProjects) => {
            return oldProjects.map((project) => project.id === result.value.data.onUpdateProject.id ? result.value.data.onUpdateProject : project)
          })
        }
      })
    }
    const deleteClient = API.graphql(graphqlOperation(onDeleteProject, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in deleteClient) {
      deleteClient.subscribe({
        next: (result: any) => {
          setProjects((oldProjects) => {
            return oldProjects.filter((project) => project.id !== result.value.data.onDeleteProject.id)
          })
        }
      })
    }
  }

  useEffect(() => {
    fetchUser()
    fetchData()
    attachSubscription()
  }, [])

  // 

  const router = useRouter()

  // 

  // const handleActive = () => {
  //   setName('')
  //   setContent('')
  // }

  const createItem = async () => {
    try {
      const id = Math.floor(Math.random() * 999999999999)
      const withData = { input: { id, name, content } }
      await API.graphql(graphqlOperation(createProject, withData))
      setName('')
      setContent('')
      setIsActiveCreateModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  const confirmUpdateItem = (id: string, name: string, content: string)  => {
    setTargetProjectID(id)
    setName(name)
    setContent(content)
    setIsActiveUpdateModal(true)
  }

  const updateItem = async () => {
    try {
      const withData = { input: { id: targetProjectID, name, content } }
      await API.graphql(graphqlOperation(updateProject, withData))
      setName('')
      setContent('')
      setIsActiveUpdateModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  const confirmDeleteItem = (id: string) => {
    setTargetProjectID(id)
    setIsActiveDeleteModal(true)
  }

  const deleteItem = async () => {
    try {
      const withData = { input: { id: targetProjectID }}
      await API.graphql(graphqlOperation(deleteProject, withData))
      setTargetProjectID('')
      setIsActiveDeleteModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  // 

  return isLoaded ? (
    isAuthenticated ? (
      <div>
        <Modal
          isActive={isActiveCreateModal}
          handleActive={setIsActiveCreateModal}
        >
          <input className={styles.input} type="text" placeholder="Project Name" value={name} onChange={(eve) => setName(eve.target.value)}/>
          <input className={styles.input} type="text" placeholder="Project Content" value={content} onChange={(eve) => setContent(eve.target.value)}/>
          <button className={`${styles.button} ${styles.button_blue}`} onClick={() => createItem()}>Create</button>
        </Modal>
        <Modal
          isActive={isActiveUpdateModal}
          handleActive={setIsActiveUpdateModal}
        >
          <input className={styles.input} type="text" placeholder="Project Name" value={name} onChange={(eve) => setName(eve.target.value)}/>
          <input className={styles.input} type="text" placeholder="Project Content" value={content} onChange={(eve) => setContent(eve.target.value)}/>
          <button className={`${styles.button} ${styles.button_blue}`} onClick={() => updateItem()}>Update</button>
        </Modal>
        <Modal
          isActive={isActiveDeleteModal}
          handleActive={setIsActiveDeleteModal}
        >
          <p className={styles.text}>本当に削除しますか?</p>
          <button className={`${styles.button} ${styles.button_pink}`} onClick={() => deleteItem()}>Delete</button>
        </Modal>
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
                <button className={styles.project_body_button} onClick={() => confirmUpdateItem(project.id, project.name, project.content)}><AiOutlineEdit /></button>
                <button className={styles.project_body_button} onClick={() => confirmDeleteItem(project.id)}><AiOutlineDelete /></button>
              </div>
            </li>
          ))}
          <li className={`${styles.project} ${styles.project_last}`} onClick={() => setIsActiveCreateModal(true)}><AiOutlinePlus /></li>
        </ul>
      </div>
    ) : (
      <div>
        <p className={styles.navigate}>Sign in is required.</p>
        <p className={styles.navigate}><span className={styles.navigate__bold}>{navigateSeconds}</span> seconds later you will be on your way.</p>
      </div>
    )
  ) : (
    <ul className={styles.projects}>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
      <li className={styles.project}></li>
    </ul>
  )
}

export default Home
