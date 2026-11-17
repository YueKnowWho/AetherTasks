export function createDomController(
  projectManager,
  { root = document.body, onChange = () => {} } = {},
) {
  let colorMode = "light";

  const app = document.createElement("main");
  app.className = "app";
  root.replaceChildren(app);

  const header = document.createElement("header");
  header.className = "app-header";

  const heading = document.createElement("h1");
  heading.textContent = "Todo List";

  const modeButton = document.createElement("button");
  modeButton.type = "button";
  modeButton.textContent = "Dark mode";
  modeButton.addEventListener("click", updateColorMode);

  header.append(heading, modeButton);

  const projectForm = document.createElement("form");
  projectForm.className = "project-form";
  projectForm.innerHTML = `
    <label>
      Project name
      <input name="title" type="text" required>
    </label>
    <button type="submit">Add project</button>
  `;
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(projectForm);
    projectManager.addProject({ title: formData.get("title") });
    projectForm.reset();
    onChange();
    renderProjectManager();
  });

  const projectList = document.createElement("section");
  projectList.className = "projects";

  app.append(header, projectForm, projectList);

  function renderProjectManager() {
    projectList.replaceChildren();

    if (projectManager.list.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No projects yet.";
      projectList.append(emptyMessage);
      return;
    }

    projectManager.list.forEach((project) => {
      projectList.append(renderProject(project));
    });
  }

  function renderProject(project) {
    const projectElement = document.createElement("article");
    projectElement.className = "project";

    const projectHeader = document.createElement("div");
    projectHeader.className = "project-header";

    const title = document.createElement("h2");
    title.textContent = project.title;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete project";
    deleteButton.addEventListener("click", () => {
      projectManager.removeProject(project.id);
      onChange();
      renderProjectManager();
    });

    projectHeader.append(title, deleteButton);

    const taskForm = document.createElement("form");
    taskForm.className = "task-form";
    taskForm.innerHTML = `
      <input name="title" type="text" placeholder="Task title" required>
      <button type="submit">Add task</button>
    `;
    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(taskForm);
      project.addTask({ title: formData.get("title") });
      taskForm.reset();
      onChange();
      renderProjectManager();
    });

    const taskList = document.createElement("ul");
    taskList.className = "task-list";

    if (project.toDoList.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No tasks yet.";
      taskList.append(emptyMessage);
    } else {
      project.toDoList.forEach((task) => {
        taskList.append(renderTask(project, task));
      });
    }

    projectElement.append(projectHeader, taskForm, taskList);
    return projectElement;
  }

  function renderTask(project, task) {
    const taskElement = document.createElement("li");
    taskElement.className = "task";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.textContent = task.complete ? "Completed" : "Complete";
    completeButton.addEventListener("click", () => {
      task.toggleComplete();
      onChange();
      renderProjectManager();
    });

    const title = document.createElement("span");
    title.textContent = task.title;
    title.className = task.complete ? "completed" : "";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      project.removeTask(task.id);
      onChange();
      renderProjectManager();
    });

    taskElement.append(completeButton, title, deleteButton);
    return taskElement;
  }

  function updateColorMode() {
    colorMode = colorMode === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = colorMode;
    modeButton.textContent = colorMode === "light" ? "Dark mode" : "Light mode";
  }

  renderProjectManager();

  return Object.freeze({
    renderProjectManager,
    renderProject: (project) => renderProject(project),
    renderTask: (project, task) => renderTask(project, task),
    updateColorMode,
  });
}
