import Auth from '@aws-amplify/auth'
import API, { graphqlOperation, GraphQLResult } from '@aws-amplify/api'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getProject } from '../../graphql/queries'
import { createBoard, updateBoard, deleteBoard, createTask, updateTask, deleteTask } from '../../graphql/mutations'
import styles from '../../styles/Project.module.scss'

type AuthenticatedUserType = {
  email: string,
  email_verified: boolean
}

type ProjectType = {
  id: string,
  name: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  owner: string,
  boards: {
    items: BoardType[]
  }
}

type BoardType = {
  id: string,
  projectID: string,
  name: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  owner: string,
  tasks: {
    items: TaskType[]
  }
}

type TaskType = {
  id: string,
  boardID: string,
  name: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  owner: string
}

const Project: NextPage = () => {

  // ログインしているかを判定
  // true:  listTasksを実行
  // false: /profile/へ遷移

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType>({ email: '', email_verified: false })
  const [name, setName] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [project, setProject] = useState<ProjectType|null>(null)

  // 

  const router = useRouter()
  const projectID = router.query.id

  // 

  const fetchUserAndData = async () => {
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
      const { id } = router.query
      const withData = { id }
      const data = await API.graphql(graphqlOperation(getProject, withData))
      setProject(data.data.getProject)
      console.log(data.data.getProject)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUserAndData()
    projectID && fetchData()
  }, [projectID])

  // 

  const createBoardAsync = async () => {
    try {
      const id = Math.floor(Math.random() * 999999999999)
      const withData = { input: { id, name, content, projectID } }
      await API.graphql(graphqlOperation(createBoard, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const updateBoardAsync = async () => {
    try {
      
    } catch (err) {
      console.log(err)
    }
  }

  const deleteBoardAsync = async (id: string) => {
    try {
      const withData = { input: { id } }
      await API.graphql(graphqlOperation(deleteBoard, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const createTaskAsync = async (boardID: string) => {
    try {
      const id = Math.floor(Math.random() * 999999999999)
      const withData = { input: { id, name, content, boardID } }
      await API.graphql(graphqlOperation(createTask, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const updateTaskAsync = async () => {
    try {

    } catch (err) {
      console.log(err)
    }
  }

  const deleteTaskAsync = async (id: string) => {
    try {
      const withData = { input: { id } }
      await API.graphql(graphqlOperation(deleteTask, withData))
    } catch (err) {
      console.log(err)
    }
  }

  // 

  return isAuthenticated ? (
    <div>
      <div>Project - authenticated</div>
      <div>
        <input type="text" value={name} onChange={(eve) => setName(eve.target.value)} />
      </div>
      <div>
        <input type="text" value={content} onChange={(eve) => setContent(eve.target.value)} />
      </div>
      <button onClick={() => createBoardAsync()}>createBoardAsync</button>
      <ul className={styles.boards}>
        {project?.boards.items.map((board) => (
          <li key={board.id} className={styles.board}>
            <div className={styles.board_head}>{board.name}</div>
            <div className={styles.board_body}>
              <button onClick={() => deleteBoardAsync(board.id)}>deleteBoardAsync</button>
              <div>
                <button onClick={() => createTaskAsync(board.id)}>createTaskAsync</button>
                <ul>
                  {board.tasks.items.map((task) => (
                    <li key={task.id}>
                      <div>
                        {task.name}
                      </div>
                      <div>
                        <button onClick={() => deleteTaskAsync(task.id)}>deleteTaskAsync</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div>
      <div>Project - not authenticated</div>
    </div>
  )
}

export default Project
