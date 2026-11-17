import { createProject } from "./project.js";

export function createProjectManager({ projectList = [] } = {}) {
  const projects = projectList.map((projectData) => createProject(projectData));

  return Object.freeze({
    get list() {
      return [...projects];
    },

    getProject(projectId) {
      return projects.find((project) => project.id === projectId);
    },

    addProject(projectData = {}) {
      const project = createProject(projectData);
      projects.push(project);
      return project;
    },

    removeProject(projectId) {
      const index = projects.findIndex((project) => project.id === projectId);

      if (index === -1) {
        throw new Error(`Project not found: ${projectId}`);
      }

      projects.splice(index, 1);
    },

    toJSON() {
      return {
        projectList: projects.map((project) => project.toJSON()),
      };
    },
  });
}