export function createTask({
  id = crypto.randomUUID(),
  title = "",
  description = "",
  dueDate = "",
  priority = "none",
  complete = false,
} = {}) {
  const taskId = id;
  let taskTitle = title;
  let taskDescription = description;
  let taskDueDate = dueDate;
  let taskPriority = priority;
  let isComplete = complete;
  return Object.freeze({
    get id() {
      return taskId;
    },

    get title() {
      return taskTitle;
    },

    get description() {
      return taskDescription;
    },

    get dueDate() {
      return taskDueDate;
    },

    get priority() {
      return taskPriority;
    },

    get complete() {
      return isComplete;
    },
    update({
      title = taskTitle,
      description = taskDescription,
      dueDate = taskDueDate,
      priority = taskPriority,
    } = {}) {
      taskTitle = title;
      taskDescription = description;
      taskDueDate = dueDate;
      taskPriority = priority;
    },
    toggleComplete() {
      isComplete = !isComplete;
    },
    toJSON() {
      return {
        id: taskId,
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        priority: taskPriority,
        complete: isComplete,
      };
    },
  });
}
