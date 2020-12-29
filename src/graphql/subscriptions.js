/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject($owner: String!) {
    onCreateProject(owner: $owner) {
      id
      name
      content
      boards {
        items {
          id
          name
          content
          order
          projectID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject($owner: String!) {
    onUpdateProject(owner: $owner) {
      id
      name
      content
      boards {
        items {
          id
          name
          content
          order
          projectID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject($owner: String!) {
    onDeleteProject(owner: $owner) {
      id
      name
      content
      boards {
        items {
          id
          name
          content
          order
          projectID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateBoard = /* GraphQL */ `
  subscription OnCreateBoard($owner: String!) {
    onCreateBoard(owner: $owner) {
      id
      name
      content
      order
      projectID
      project {
        id
        name
        content
        boards {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      tasks {
        items {
          id
          name
          content
          order
          boardID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateBoard = /* GraphQL */ `
  subscription OnUpdateBoard($owner: String!) {
    onUpdateBoard(owner: $owner) {
      id
      name
      content
      order
      projectID
      project {
        id
        name
        content
        boards {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      tasks {
        items {
          id
          name
          content
          order
          boardID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteBoard = /* GraphQL */ `
  subscription OnDeleteBoard($owner: String!) {
    onDeleteBoard(owner: $owner) {
      id
      name
      content
      order
      projectID
      project {
        id
        name
        content
        boards {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      tasks {
        items {
          id
          name
          content
          order
          boardID
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateTask = /* GraphQL */ `
  subscription OnCreateTask($owner: String!) {
    onCreateTask(owner: $owner) {
      id
      name
      content
      order
      boardID
      board {
        id
        name
        content
        order
        projectID
        project {
          id
          name
          content
          createdAt
          updatedAt
          owner
        }
        tasks {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateTask = /* GraphQL */ `
  subscription OnUpdateTask($owner: String!) {
    onUpdateTask(owner: $owner) {
      id
      name
      content
      order
      boardID
      board {
        id
        name
        content
        order
        projectID
        project {
          id
          name
          content
          createdAt
          updatedAt
          owner
        }
        tasks {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteTask = /* GraphQL */ `
  subscription OnDeleteTask($owner: String!) {
    onDeleteTask(owner: $owner) {
      id
      name
      content
      order
      boardID
      board {
        id
        name
        content
        order
        projectID
        project {
          id
          name
          content
          createdAt
          updatedAt
          owner
        }
        tasks {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
