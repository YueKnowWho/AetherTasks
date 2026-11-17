import "./style.css";
import { createProjectManager } from "./projectManager.js";
import { load, save } from "./storage.js";
import { createDomController } from "./domController.js";

const storageKey = "todo-list";
const savedData = load(storageKey);
const projectManager = savedData === null
  ? createProjectManager()
  : createProjectManager(savedData);

const controller = createDomController(projectManager, {
  onChange: () => save(storageKey, projectManager),
});

controller.renderProjectManager();