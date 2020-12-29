import Auth from '@aws-amplify/auth'
import API, { graphqlOperation, GraphQLResult } from '@aws-amplify/api'
import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { getProject } from '../../graphql/queries'
import { createBoard, updateBoard, deleteBoard, createTask, updateTask, deleteTask } from '../../graphql/mutations'
import styles from '../../styles/Project.module.scss'
import { onCreateBoard, onUpdateBoard, onDeleteProject, onCreateTask, onUpdateTask, onDeleteTask, onDeleteBoard } from '../../graphql/subscriptions'

const reorder = (
  list: BoardType[],
  startIndex: number,
  endIndex: number
): BoardType[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

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
  order: number,
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
  order: number,
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
      const projectFromData = data.data.getProject
      projectFromData.boards.items.sort((a, b) => a.order - b.order);
      setProject(projectFromData)
      // onDeleteProject
      // onDeleteTask
    } catch (err) {
      console.log(err)
    }
  }

  const attachSubscription = async () => {
    const createClient = API.graphql(graphqlOperation(onCreateBoard, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in createClient) {
      createClient.subscribe({
        next: (result: any) => {
          setProject((oldProject) => ({
            ...oldProject,
            boards: {
              items: [
                ...oldProject.boards.items,
                result.value.data.onCreateBoard
              ]
            }
          }))
        }
      });
    }
    const updateClient = API.graphql(graphqlOperation(onUpdateBoard, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in updateClient) {
      updateClient.subscribe({
        next: (result: any) => {
          console.log(result)
        }
      })
    }
    const deleteClient = API.graphql(graphqlOperation(onDeleteBoard, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in deleteClient) {
      deleteClient.subscribe({
        next: (result: any) => {
          setProject((oldProject) => ({
            ...oldProject,
            boards: {
              items: oldProject.boards.items.filter((item) => item.id !== result.value.data.onDeleteBoard.id)
            }
          }))
        }
      })
    }
  }

  // setTodos((oldTodos) => [
  //   {...result.value.data.onCreateTodo},
  //   ...oldTodos
  // ])

  useEffect(() => {
    fetchUserAndData()
    if (projectID) {
      fetchData()
      attachSubscription()
    }
  }, [projectID])

  // 

  const createBoardAsync = async () => {
    try {
      const id = Math.floor(Math.random() * 999999999999)
      const withData = { input: { id, name, content, order: project.boards.items.length, projectID } }
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

  const updateBoardOrderAsync = async (id: string, order: number) => {
    try {
      const withData = { input: { id, order } }
      await API.graphql(graphqlOperation(updateBoard, withData))
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

  const Item = ({ item, index }) => {
    return (
      <Draggable draggableId={item.id} index={index}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {item.id}
          </div>
        )}
      </Draggable>
    );
  }

  const onDragEnd = (res) => {
    if (!res.destination) {
      return;
    }

    if (res.destination.index === res.source.index) {
      return;
    }

    const items = reorder(
      project.boards.items,
      res.source.index,
      res.destination.index
    );

    const newProject = {
      ...project,
      boards: { items }
    }

    setProject(newProject);

    newProject.boards.items.forEach((item, index) => {
      updateBoardOrderAsync(item.id, index);
    })

  }

  return isAuthenticated ? (
    <div>
      <div>
        <input type="text" value={name} onChange={(eve) => setName(eve.target.value)} />
      </div>
      <div>
        <input type="text" value={content} onChange={(eve) => setContent(eve.target.value)} />
      </div>
      <button onClick={() => createBoardAsync()}>createBoardAsync</button>
      
      {/* <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <>
                {project?.boards.items.map((board, index) => (
                  <Item item={board} index={index} key={board.id} />
                ))}
              </>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext> */}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list" direction="horizontal">
          {providedParent => (
            <ul
              className={styles.boards}
              ref={providedParent.innerRef}
              {...providedParent.droppableProps}
            >
              {project?.boards.items.map((board, index) => (
                <Draggable draggableId={board.id} index={index} key={board.id}>
                  {providedChild => (
                    <li 
                      key={board.id}
                      className={styles.board}
                      ref={providedChild.innerRef}
                      {...providedChild.draggableProps}
                      {...providedChild.dragHandleProps}
                    >
                      <div className={styles.board_head}>{board.name}</div>
                      <div className={styles.board_body}>
                        <button onClick={() => deleteBoardAsync(board.id)}>deleteBoardAsync</button>
                        <div>
                          <button onClick={() => createTaskAsync(board.id)}>createTaskAsync</button>
                          <ul className={styles.tasks}>
                            {/* {board?.tasks.items.map((task) => (
                              <li key={task.id} className={styles.task}>
                                <div>
                                  {task.name}
                                </div>
                                <div>
                                  <button onClick={() => deleteTaskAsync(task.id)}>deleteTaskAsync</button>
                                </div>
                              </li>
                            ))} */}
                          </ul>
                        </div>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              <li className={`${styles.board} ${styles.board_open}`} onClick={() => alert('Modal')}>+</li>
              {providedParent.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {/* <ul className={styles.boards}>
        {project?.boards.items.map((board) => (
          <li key={board.id} className={styles.board}>
            <div className={styles.board_head}>{board.name}</div>
            <div className={styles.board_body}>
              <button onClick={() => deleteBoardAsync(board.id)}>deleteBoardAsync</button>
              <div>
                <button onClick={() => createTaskAsync(board.id)}>createTaskAsync</button>
                <ul className={styles.tasks}>
                  {board.tasks.items.map((task) => (
                    <li key={task.id} className={styles.task}>
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
      </ul> */}
    </div>
  ) : (
    <div>
      <div>Project - not authenticated</div>
    </div>
  )
}

export default Project
