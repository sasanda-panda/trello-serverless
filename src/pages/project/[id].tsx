import Auth from '@aws-amplify/auth'
import API, { graphqlOperation, GraphQLResult } from '@aws-amplify/api'
import React, { FC, useEffect, useState } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { getProject } from '../../graphql/queries'
import { createBoard, updateBoard, deleteBoard, createTask, updateTask, deleteTask } from '../../graphql/mutations'
import styles from '../../styles/Project.module.scss'
import { onCreateBoard, onUpdateBoard, onDeleteProject, onCreateTask, onUpdateTask, onDeleteTask, onDeleteBoard } from '../../graphql/subscriptions'
import Modal from '../../components/organisms/Modal'

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

const reorderTask = (
  list: TaskType[],
  startIndex: number,
  endIndex: number
): TaskType[] => {
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

const DroppableBoard: FC<{onClick: () => void}> = ({ onClick, children }) => {
  return (
    <Droppable droppableId="boards-of-project" type="droppableBoard" direction="horizontal">
      {provided => (
        <ul className={styles.boards} ref={provided.innerRef} {...provided.droppableProps}>
          {children}
          <li className={styles.board} onClick={onClick} ></li>
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  )
}

const DraggableBoard: FC<{board: BoardType, index: number}> = ({ board, index, children }) => {
  return (
    <Draggable draggableId={board.id} index={index}>
      {provided => (
        <li className={styles.board} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          {children}
        </li>
      )}
    </Draggable>
  )
}

const DroppableTask: FC<{board: BoardType}> = ({ board, children }) => {
  return (
    <Droppable droppableId={`tasks-of-board-${board.id}`} type="droppableTask" direction="vertical">
      {provided => (
        <ul className={styles.tasks} ref={provided.innerRef} {...provided.droppableProps}>
          {children}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  )
}

const DraggableTask: FC<{task: TaskType, index: number}> = ({ task, index, children }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {provided => (
        <li className={styles.task} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          {children}
        </li>
      )}
    </Draggable>
  )
}

const Project: NextPage = () => {

  // ログインしているかを判定
  // true:  listTasksを実行
  // false: /profile/へ遷移

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType>({ email: '', email_verified: false })
  const [targetBoard, setTargetBoard] = useState<BoardType|null>(null)
  const [isActiveCreateBoardModal, setIsActiveCreateBoardModal] = useState<boolean>(false)
  const [isActiveUpdateBoardModal, setIsActiveUpdateBoardModal] = useState<boolean>(false)
  const [isActiveDeleteBoardModal, setIsActiveDeleteBoardModal] = useState<boolean>(false)
  const [targetTask, setTargetTask] = useState<TaskType|null>(null)
  const [isActiveCreateTaskModal, setIsActiveCreateTaskModal] = useState<boolean>(false)
  const [isActiveUpdateTaskModal, setIsActiveUpdateTaskModal] = useState<boolean>(false)
  const [isActiveDeleteTaskModal, setIsActiveDeleteTaskModal] = useState<boolean>(false)
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
      const data: any = await API.graphql(graphqlOperation(getProject, withData))
      const projectFromData = data.data.getProject
      projectFromData.boards.items.sort((a, b) => a.order - b.order);
      projectFromData.boards.items.map((item) => item.tasks && item.tasks.items.sort((a, b) => a.order - b.order))
      setProject(projectFromData)
    } catch (err) {
      console.log(err)
    }
  }

  const attachSubscription = async () => {
    const createBoardClient = API.graphql(graphqlOperation(onCreateBoard, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in createBoardClient) {
      createBoardClient.subscribe({
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
    const updateBoardClient = API.graphql(graphqlOperation(onUpdateBoard, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in updateBoardClient) {
      updateBoardClient.subscribe({
        next: (result: any) => {
          setProject((oldProject) => ({
            ...oldProject,
            boards: {
              items: oldProject.boards.items.map((item) => item.id === result.value.data.onUpdateBoard.id ? result.value.data.onUpdateBoard : item)
            }
          }))
        }
      })
    }
    const deleteBoardClient = API.graphql(graphqlOperation(onDeleteBoard, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in deleteBoardClient) {
      deleteBoardClient.subscribe({
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
    const createTaskClient = API.graphql(graphqlOperation(onCreateTask, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in createTaskClient) {
      createTaskClient.subscribe({
        next: (result: any) => {
          setProject((oldProject) => ({
            ...oldProject,
            boards: {
              items: oldProject.boards.items.map((item) => {
                if (item.id === result.value.data.onCreateTask.boardID) {
                  return {
                    ...item,
                    tasks: {
                      items: [
                        ...item.tasks.items,
                        result.value.data.onCreateTask
                      ]
                    }
                  }
                } else {
                  return item
                }
              })
            }
          }))
        }
      })
    }
    const updateTaskClient = API.graphql(graphqlOperation(onUpdateTask, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in updateTaskClient) {
      updateTaskClient.subscribe({
        next: (result: any) => {
          // result.value.data.onUpdateTask
          // alert('updateTaskClient')
          setProject((oldProject) => ({
            ...oldProject,
            boards: {
              items: oldProject.boards.items.map((item) => {
                if (item.id === result.value.data.onUpdateTask.boardID) {
                  return {
                    ...item,
                    tasks: {
                      items: item.tasks.items.map((item) => item.id === result.value.data.onUpdateTask.id ? result.value.data.onUpdateTask : item)
                    }
                  }
                } else {
                  return item
                }
              })
            }
          }))
        }
      })
    }
    const deleteTaskClient = API.graphql(graphqlOperation(onDeleteTask, { owner: (await Auth.currentAuthenticatedUser()).username }))
    if ("subscribe" in deleteTaskClient) {
      deleteTaskClient.subscribe({
        next: (result: any) => {
          setProject((oldProject) => ({
            ...oldProject,
            boards: {
              items: oldProject.boards.items.map((item) => {
                if (item.id === result.value.data.onDeleteTask.boardID) {
                  return {
                    ...item,
                    tasks: {
                      items: item.tasks.items.filter((item) => item.id !== result.value.data.onDeleteTask.id)
                    }
                  }
                } else {
                  return item
                }
              })
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
      setName('')
      setContent('')
      setIsActiveCreateBoardModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  const confirmUpdateBoard = (board: BoardType) => {
    setTargetBoard(board)
    setName(board.name)
    setContent(board.content)
    setIsActiveUpdateBoardModal(true)
  }

  const updateBoardAsync = async () => {
    try {
      const withData = { input: { id: targetBoard.id, name, content } }
      await API.graphql(graphqlOperation(updateBoard, withData))
      setName('')
      setContent('')
      setTargetBoard(null)
      setIsActiveUpdateBoardModal(false)
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

  const confirmDeleteBoard = (board: BoardType) => {
    setTargetBoard(board)
    setIsActiveDeleteBoardModal(true)
  }

  const deleteBoardAsync = async () => {
    try {
      const withData = { input: { id: targetBoard.id } }
      await API.graphql(graphqlOperation(deleteBoard, withData))
      setTargetBoard(null)
      setIsActiveDeleteBoardModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  const confirmCreateTask = (board: BoardType) => {
    setTargetBoard(board)
    setIsActiveCreateTaskModal(true)
  }

  const createTaskAsync = async () => {
    try {
      const id = Math.floor(Math.random() * 999999999999)
      const order = targetBoard.tasks ? targetBoard.tasks.items.length : 0;
      const withData = { input: { id, name, content, order, boardID: targetBoard.id } }
      await API.graphql(graphqlOperation(createTask, withData))
      setName('')
      setContent('')
      setIsActiveCreateTaskModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  const confirmUpdateTask = (task: TaskType) => {
    setTargetTask(task)
    setName(task.name)
    setContent(task.content)
    setIsActiveUpdateTaskModal(true)
  }

  const updateTaskOrderAsync = async (id: string, order: number, boardID?: string) => {
    try {
      const withData = { input: { id, order, boardID } }
      await API.graphql(graphqlOperation(updateTask, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const updateTaskAsync = async () => {
    try {
      const withData = { input: { id: targetTask.id, name, content } }
      await API.graphql(graphqlOperation(updateTask, withData))
      setName('')
      setContent('')
      setTargetTask(null)
      setIsActiveUpdateTaskModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  const confirmDeleteTask = (task: TaskType) => {
    setTargetTask(task)
    setIsActiveDeleteTaskModal(true)
  }

  const deleteTaskAsync = async () => {
    try {
      const withData = { input: { id: targetTask.id } }
      await API.graphql(graphqlOperation(deleteTask, withData))
      setTargetTask(null)
      setIsActiveDeleteTaskModal(false)
    } catch (err) {
      console.log(err)
    }
  }

  // https://codesandbox.io/s/5v2yvpjn7n

  const onDragEnd = (result) => {

    // MEMO: 
    if (!result.destination) return

    if (result.type === 'droppableBoard') {

      // MEMO: boardを移動させた場合

      if (result.destination.index === result.source.index) return

      const items = reorder(
        project.boards.items,
        result.source.index,
        result.destination.index
      );

      const newProject = {
        ...project,
        boards: { items }
      }

      setProject(newProject);

      newProject.boards.items.forEach((item, index) => {
        updateBoardOrderAsync(item.id, index);
      })

    } else if (result.type === 'droppableTask') {

      // MEMO: taskを移動させた場合

      const destinationBoardID = result.destination.droppableId.replace(/tasks-of-board-/g, '')
      const sourceBoardID = result.source.droppableId.replace(/tasks-of-board-/g, '')

      if (result.destination.droppableId === result.source.droppableId) {

        // MEMO: taskを移動させ、移動先が同じboardだった場合

        if (result.destination.index === result.source.index) return

        const items = reorderTask(
          project.boards.items.filter((item) => item.id === destinationBoardID)[0].tasks.items,
          result.source.index,
          result.destination.index
        );
  
        const newProject = {
          ...project,
          boards: {
            items: project.boards.items.map((item) => {
              if (item.id === destinationBoardID) {
                return { ...item, tasks: { items } }
              } else {
                return item
              }
            })
          }
        }

        setProject(newProject);

        newProject.boards.items.filter((item) => item.id === destinationBoardID)[0].tasks.items.forEach((item, index) => {
          updateTaskOrderAsync(item.id, index);
        })

      } else {

        // MEMO: taskを移動させ、移動先が別のboardだった場合

        const draggedTask = project
          .boards.items.filter((item) => item.id === sourceBoardID)[0]
          .tasks.items.filter((item) => item.id === result.draggableId)[0]

        const destinationItems = project
            .boards.items.filter((item) => item.id === destinationBoardID)[0]
            .tasks.items
        destinationItems.splice(result.destination.index, 0, draggedTask)

        const sourceItems = project
          .boards.items.filter((item) => item.id === sourceBoardID)[0]
          .tasks.items.filter((item) => item.id !== draggedTask.id)

        const newProject = {
          ...project,
          boards: {
            items: project.boards.items.map((item) => {
              if (item.id === destinationBoardID) {
                return { ...item, tasks: { items: destinationItems } }
              } else if (item.id === sourceBoardID) {
                return { ...item, tasks: { items: sourceItems } }
              } else {
                return item
              }
            })
          }
        }

        setProject(newProject)

        newProject.boards.items.filter((item) => item.id === destinationBoardID || item.id === sourceBoardID).forEach((board) => {
          board.tasks.items.forEach((item, index) => {
            updateTaskOrderAsync(item.id, index, board.id);
          })
        })

      }

    } else {

      return

    }

  }

  return isAuthenticated ? (
    <div>

      {/* MEMO: ボード作成用モーダル */}
      <Modal isActive={isActiveCreateBoardModal} handleActive={setIsActiveCreateBoardModal}>
        <input className={styles.input} type="text" placeholder="Board name" value={name} onChange={(eve) => setName(eve.target.value)}/>
        <input className={styles.input} type="text" placeholder="Board content" value={content} onChange={(eve) => setContent(eve.target.value)}/>
        <button className={`${styles.button} ${styles.button_blue}`} onClick={() => createBoardAsync()}>Create</button>
      </Modal>

      {/* MEMO: ボード更新用モーダル */}
      <Modal isActive={isActiveUpdateBoardModal} handleActive={setIsActiveUpdateBoardModal}>
        <input className={styles.input} type="text" placeholder="Board name" value={name} onChange={(eve) => setName(eve.target.value)}/>
        <input className={styles.input} type="text" placeholder="Board content" value={content} onChange={(eve) => setContent(eve.target.value)}/>
        <button className={`${styles.button} ${styles.button_blue}`} onClick={() => updateBoardAsync()}>Update</button>
      </Modal>

      {/* MEMO: ボード削除用モーダル */}
      <Modal isActive={isActiveDeleteBoardModal} handleActive={setIsActiveDeleteBoardModal}>
        <p className={styles.text}>本当に削除しますか?</p>
        <button className={`${styles.button} ${styles.button_pink}`} onClick={() => deleteBoardAsync()}>Delete</button>
      </Modal>

      {/* MEMO: タスク作成用モーダル */}
      <Modal isActive={isActiveCreateTaskModal} handleActive={setIsActiveCreateTaskModal}>
        <input className={styles.input} type="text" placeholder="Task name" value={name} onChange={(eve) => setName(eve.target.value)}/>
        <input className={styles.input} type="text" placeholder="Task content" value={content} onChange={(eve) => setContent(eve.target.value)}/>
        <button className={`${styles.button} ${styles.button_blue}`} onClick={() => createTaskAsync()}>Create</button>
      </Modal>

      {/* MEMO: タスク更新用モーダル */}
      <Modal isActive={isActiveUpdateTaskModal} handleActive={setIsActiveUpdateTaskModal}>
        <input className={styles.input} type="text" placeholder="Task name" value={name} onChange={(eve) => setName(eve.target.value)}/>
        <input className={styles.input} type="text" placeholder="Task content" value={content} onChange={(eve) => setContent(eve.target.value)}/>
        <button className={`${styles.button} ${styles.button_blue}`} onClick={() => updateTaskAsync()}>Update</button>
      </Modal>

      {/* MEMO: タスク削除用モーダル */}
      <Modal isActive={isActiveDeleteTaskModal} handleActive={setIsActiveDeleteTaskModal}>
        <p className={styles.text}>本当に削除しますか?</p>
        <button className={`${styles.button} ${styles.button_pink}`} onClick={() => deleteTaskAsync()}>Delete</button>
      </Modal>

      <DragDropContext onDragEnd={onDragEnd}>
        <DroppableBoard onClick={() => setIsActiveCreateBoardModal(true)}>
          {project?.boards?.items.map((board, index) => (
            <DraggableBoard board={board} index={index} key={board.id}>
              <>
                <div className={styles.board_tab}></div>
                <div className={styles.board_head}>{board.name}</div>
                <div className={styles.board_body}>
                  <div>
                    <button onClick={() => confirmUpdateBoard(board)}>Update Board</button>
                  </div>
                  <div>
                    <button onClick={() => confirmDeleteBoard(board)}>Delete Board</button>
                  </div>
                  <div>
                    <button onClick={() => confirmCreateTask(board)}>Create Task</button>
                      <DroppableTask board={board}>
                        {board?.tasks?.items.map((task, index) => (
                          <DraggableTask task={task} index={index} key={task.id}>
                            <>
                              <div>{task.name}</div>
                              <div>
                                <div><button onClick={() => confirmUpdateTask(task)}>Update Task</button></div>
                                <div><button onClick={() => confirmDeleteTask(task)}>Delete Task</button></div>
                              </div>
                            </>
                          </DraggableTask>
                        ))}
                      </DroppableTask>
                  </div>
                </div>
              </>
            </DraggableBoard>
          ))}
        </DroppableBoard>
      </DragDropContext>

    </div>
  ) : (
    <div>
      <div>Project - not authenticated</div>
    </div>
  )
}

export default Project
