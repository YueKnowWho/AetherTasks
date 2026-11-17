import "./style.css";
import { createProjectManager } from "./projectManager.js";
import { load, remove, save } from "./storage.js";

const storageKey = "todo-list-test";
remove(storageKey);

const manager = createProjectManager();
const project = manager.addProject({ title: "School" });
const task = project.addTask({
  title: "Study JavaScript",
  description: "Review factory functions",
  priority: "high",
});

task.update({ dueDate: "2026-11-20" });
task.toggleComplete();

console.assert(project.title === "School", "Project title should be readable");
console.assert(task.complete === true, "Task should be complete");
console.assert(
  project.getTask(task.id) === task,
  "Project should return the stored task",
);

save(storageKey, manager);

const restoredData = load(storageKey);
const restoredManager = createProjectManager(restoredData);
const restoredProject = restoredManager.getProject(project.id);
const restoredTask = restoredProject.getTask(task.id);

console.assert(
  restoredTask.title === "Study JavaScript",
  "Task title should survive storage",
);
console.assert(
  restoredTask.complete === true,
  "Task completion should survive storage",
);
console.assert(
  typeof restoredTask.update === "function",
  "Task methods should be restored",
);
console.assert(
  typeof restoredProject.addTask === "function",
  "Project methods should be restored",
);
console.assert(
  typeof restoredManager.addProject === "function",
  "Manager methods should be restored",
);

restoredProject.removeTask(restoredTask.id);
restoredManager.removeProject(restoredProject.id);

console.log("Task, project, project manager, and storage tests passed.");