### Requirements
- Project Manager
    - properties
        - list of project objects
    - methods
        - project manager constructor
        - create project
        - read project list
        - delete project
        - project lookup

- Project
    - properties
        - id
        - title
        - list of to do objects
    - methods
        - project constructor
        - create a new task
        - read project name
        - read task list
        - task lookup
        - read task
        - update project name
        - delete task
- Task
    - properties
        - id
        - string: title
        - string: description
        - date: due date
        - priority
        - complete
    - methods
        - task constructor
        - update task
        - read task
        - toggle complete
- storage
    - methods
        - save project manager to storage
        - load project manager from storage
        - clear storage
- domController
    - properties
        - dark or light mode
    - methods
        - domController constructor
        - render project manager
        - render project helper
        - render task helper
        - update mode

index.js (Controller / Entry Point)
            │                        │
            ▼                        ▼
    projectManager.js               domController.js
    │           │               (Pure DOM/UI)
    ▼           ▼
project.js    storage.js
    │
    ▼
task.js
