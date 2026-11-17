import { format, isValid, parseISO } from "date-fns";

export function createDomController(
  projectManager,
  { root = document.body, onChange = () => {} } = {},
) {
  let colorMode = "dark";
  let selectedProjectId = projectManager.list[0]?.id ?? null;
  let statusFilter = "all";
  let searchQuery = "";

  const app = document.createElement("main");
  app.className = "app-shell";
  root.replaceChildren(app);

  const background = document.createElement("div");
  background.className = "mesh-background";
  background.innerHTML = '<span class="orb orb-one"></span><span class="orb orb-two"></span><span class="orb orb-three"></span>';

  const header = document.createElement("header");
  header.className = "app-header glass-panel";
  header.innerHTML = `
    <div>
      <p class="eyebrow">PERSONAL WORKSPACE</p>
      <h1>Aether<span>Tasks</span></h1>
      <p class="header-subtitle">A calm space for focused progress.</p>
    </div>
  `;

  const modeButton = document.createElement("button");
  modeButton.className = "icon-button";
  modeButton.type = "button";
  modeButton.setAttribute("aria-label", "Switch color mode");
  modeButton.textContent = "☼";
  modeButton.addEventListener("click", updateColorMode);
  header.append(modeButton);

  const layout = document.createElement("div");
  layout.className = "dashboard-layout";

  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar glass-panel";

  const sidebarHeading = document.createElement("div");
  sidebarHeading.className = "section-heading";
  sidebarHeading.innerHTML = "<h2>Projects</h2>";

  const addProjectButton = document.createElement("button");
  addProjectButton.className = "primary-button small-button";
  addProjectButton.type = "button";
  addProjectButton.textContent = "+ New project";
  addProjectButton.addEventListener("click", () => {
    const title = window.prompt("Project name");
    if (title?.trim()) {
      const project = projectManager.addProject({ title: title.trim() });
      selectedProjectId = project.id;
      persistAndRender();
    }
  });
  sidebarHeading.append(addProjectButton);

  const projectNavigation = document.createElement("nav");
  projectNavigation.className = "project-navigation";
  projectNavigation.setAttribute("aria-label", "Projects");
  sidebar.append(sidebarHeading, projectNavigation);

  const content = document.createElement("section");
  content.className = "dashboard-content";

  const summary = document.createElement("section");
  summary.className = "summary-grid";

  const taskBoard = document.createElement("section");
  taskBoard.className = "task-board glass-panel";

  layout.append(sidebar, content);
  content.append(summary, taskBoard);
  app.append(background, header, layout);

  function getSelectedProject() {
    return selectedProjectId === null
      ? undefined
      : projectManager.getProject(selectedProjectId);
  }

  function renderProjectManager() {
    if (!getSelectedProject() && projectManager.list.length > 0) {
      selectedProjectId = projectManager.list[0].id;
    }

    renderProjects();
    renderSummary();
    renderTaskBoard();
  }

  function renderProjects() {
    projectNavigation.replaceChildren();

    if (projectManager.list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted-text";
      empty.textContent = "Create a project to get started.";
      projectNavigation.append(empty);
      return;
    }

    projectManager.list.forEach((project) => {
      projectNavigation.append(renderProject(project));
    });
  }

  function renderProject(project) {
    const button = document.createElement("button");
    button.className = `project-link${project.id === selectedProjectId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="project-dot"></span>
      <span class="project-link-title"></span>
      <span class="project-count">${project.toDoList.length}</span>
    `;
    button.querySelector(".project-link-title").textContent = project.title;
    button.addEventListener("click", () => {
      selectedProjectId = project.id;
      renderProjectManager();
    });
    return button;
  }

  function renderSummary() {
    const stats = projectManager.taskSummary;
    summary.replaceChildren(
      createSummaryCard("Active tasks", stats.active, "◌"),
      createSummaryCard("Completed", stats.completed, "✓"),
      createSummaryCard("Completion", `${stats.completionPercent}%`, "↗"),
    );
  }

  function createSummaryCard(label, value, icon) {
    const card = document.createElement("article");
    card.className = "summary-card glass-card";
    card.innerHTML = `
      <span class="summary-icon">${icon}</span>
      <div>
        <p class="summary-label"></p>
        <strong class="summary-value"></strong>
      </div>
    `;
    card.querySelector(".summary-label").textContent = label;
    card.querySelector(".summary-value").textContent = value;
    return card;
  }

  function renderTaskBoard() {
    const project = getSelectedProject();
    taskBoard.replaceChildren();

    if (!project) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "<h2>No project selected</h2><p>Create a project to organize your tasks.</p>";
      taskBoard.append(empty);
      return;
    }

    const boardHeader = document.createElement("div");
    boardHeader.className = "board-header";
    boardHeader.innerHTML = `
      <div>
        <p class="eyebrow">CURRENT PROJECT</p>
        <h2 class="project-title"></h2>
      </div>
      <button class="danger-button" type="button">Delete project</button>
    `;
    boardHeader.querySelector(".project-title").textContent = project.title;
    boardHeader.querySelector(".danger-button").addEventListener("click", () => {
      projectManager.removeProject(project.id);
      selectedProjectId = projectManager.list[0]?.id ?? null;
      persistAndRender();
    });

    const controls = document.createElement("div");
    controls.className = "board-controls";
    controls.innerHTML = `
      <form class="task-form">
        <input name="title" type="text" placeholder="What needs to be done?" required>
        <input name="dueDate" type="date" aria-label="Due date">
        <button class="primary-button" type="submit">Add task</button>
      </form>
      <div class="filter-row">
        <div class="filter-pills">
          <button type="button" data-filter="all" class="filter-pill active">All</button>
          <button type="button" data-filter="active" class="filter-pill">Active</button>
          <button type="button" data-filter="completed" class="filter-pill">Completed</button>
        </div>
        <input class="search-input" type="search" placeholder="Search tasks" aria-label="Search tasks">
      </div>
    `;

    const form = controls.querySelector(".task-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      project.addTask({
        title: data.get("title"),
        dueDate: data.get("dueDate"),
      });
      persistAndRender();
    });

    controls.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        statusFilter = button.dataset.filter;
        renderTaskBoard();
      });
    });

    const searchInput = controls.querySelector(".search-input");
    searchInput.value = searchQuery;
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.toLowerCase();
      renderTaskBoard();
    });

    const taskList = document.createElement("ul");
    taskList.className = "task-list";
    const visibleTasks = project.toDoList.filter((task) => {
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "completed" && task.complete)
        || (statusFilter === "active" && !task.complete);
      return matchesStatus && task.title.toLowerCase().includes(searchQuery);
    });

    if (visibleTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state compact";
      empty.innerHTML = "<h3>Nothing here yet</h3><p>Add a task or adjust your filters.</p>";
      taskList.append(empty);
    } else {
      visibleTasks.forEach((task) => taskList.append(renderTask(project, task)));
    }

    taskBoard.append(boardHeader, controls, taskList);
    controls.querySelector(`[data-filter="${statusFilter}"]`).classList.add("active");
  }

  function renderTask(project, task) {
    const item = document.createElement("li");
    item.className = `task-card glass-card${task.complete ? " complete" : ""}`;

    const completeButton = document.createElement("button");
    completeButton.className = "task-checkbox";
    completeButton.type = "button";
    completeButton.setAttribute("aria-label", task.complete ? "Mark incomplete" : "Mark complete");
    completeButton.textContent = task.complete ? "✓" : "";
    completeButton.addEventListener("click", () => {
      task.toggleComplete();
      persistAndRender();
    });

    const details = document.createElement("div");
    details.className = "task-details";
    const title = document.createElement("strong");
    title.textContent = task.title;
    details.append(title);

    if (task.description) {
      const description = document.createElement("p");
      description.textContent = task.description;
      details.append(description);
    }

    if (task.dueDate) {
      const date = document.createElement("small");
      date.className = "task-date";
      date.textContent = formatDueDate(task.dueDate);
      details.append(date);
    }

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const priority = document.createElement("span");
    priority.className = `priority priority-${task.priority}`;
    priority.textContent = task.priority;
    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-button subtle";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => {
      project.removeTask(task.id);
      persistAndRender();
    });
    actions.append(priority, deleteButton);
    item.append(completeButton, details, actions);
    return item;
  }

  function formatDueDate(value) {
    const date = parseISO(value);
    return isValid(date) ? `Due ${format(date, "MMM d, yyyy")}` : "Invalid date";
  }

  function persistAndRender() {
    onChange();
    renderProjectManager();
  }

  function updateColorMode() {
    colorMode = colorMode === "dark" ? "aurora" : "dark";
    document.documentElement.dataset.theme = colorMode;
    modeButton.textContent = colorMode === "dark" ? "☼" : "☾";
  }

  document.documentElement.dataset.theme = colorMode;
  renderProjectManager();

  return Object.freeze({
    renderProjectManager,
    renderProject,
    renderTask: (project, task) => renderTask(project, task),
    updateColorMode,
  });
}
