export function createTask({
  id = crypto.randomUUID(),
  title = "",
  description = "",
  dueDate = "",
  priority = "none",
  complete = false,
} = {}) {
    return {
        id,
        title,
        description,
        dueDate,
        priority,
        complete,

        update({
            title = this.title,
            description = this.description,
            dueDate = this.dueDate,
            priority = this.priority,
        } = {}) {
            this.title = title;
            this.description = description;
            this.dueDate = dueDate;
            this.priority = priority;
        },

        toggleComplete() {
            this.complete = !this.complete;
        },
    };  
}