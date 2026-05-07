import { todos } from "#/db/schema";
import { todoImageUrl, type Todo, type TodoImage } from "#/features/todos/shared/todos.types";

type TodoRow = typeof todos.$inferSelect;

export function serializeTodoImage(todo: TodoRow): TodoImage | null {
  if (!todo.imageKey) {
    return null;
  }

  return {
    url: todoImageUrl(todo.id, todo.updatedAt.getTime()),
    name: todo.imageName,
    contentType: todo.imageContentType,
    size: todo.imageSize,
  };
}

export function serializeTodo(todo: TodoRow): Todo {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    image: serializeTodoImage(todo),
    createdAt: todo.createdAt?.toISOString() ?? null,
    updatedAt: todo.updatedAt.toISOString(),
  };
}
