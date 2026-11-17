import { createTask } from "./task.js";

export function createProject({
  id = crypto.randomUUID(),
  title = "",
  toDoList = [],
} = {}) {
  const projectId = id;
  let projectTitle = title;

  // Rebuild task objects when loading plain JSON data.
  const tasks = toDoList.map(createTask);

  return Object.freeze({
    get id() {
      return projectId;
    },

    get title() {
      return projectTitle;
    },

    get toDoList() {
      // Prevents callers from adding/removing items from the private array.
      return [...tasks];
    },
    getTask(taskId) {
      return tasks.find((task) => task.id === taskId);
    },
    rename(newTitle) {
      projectTitle = newTitle;
    },

    addTask(taskData = {}) {
      const task = createTask(taskData);
      tasks.push(task);
      return task;
    },

    removeTask(taskId) {
      const index = tasks.findIndex((task) => task.id === taskId);

      if (index === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      tasks.splice(index, 1);
    },

    toJSON() {
      return {
        id: projectId,
        title: projectTitle,
        toDoList: tasks.map((task) => task.toJSON()),
      };
    },
  });
}
