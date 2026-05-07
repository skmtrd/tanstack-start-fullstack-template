import { and, eq } from "drizzle-orm";

import { db } from "#/db";
import { todos } from "#/db/schema";
import { todoImageConfig, todoImageUrl, type TodoImage } from "#/features/todos/shared/todos.types";
import { parseImageUploadFile } from "#/features/uploads/server/image-file.server";
import { createImageObjectKey } from "#/features/uploads/server/image-key.server";
import {
  deleteImageObject,
  deleteImageObjectSafely,
  getImageObject,
  putImageObject,
} from "#/features/uploads/server/r2-object.server";

type TodoRow = typeof todos.$inferSelect;

export function parseTodoIdParam(todoId: string) {
  const parsedTodoId = Number(todoId);
  return Number.isSafeInteger(parsedTodoId) && parsedTodoId > 0 ? parsedTodoId : null;
}

export async function findUserTodo(todoId: number, userId: string) {
  const [todo] = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .limit(1);

  return todo ?? null;
}

export function parseTodoImageFile(image: FormDataEntryValue | null) {
  return parseImageUploadFile(image, todoImageConfig);
}

export async function getTodoImage(todo: TodoRow) {
  if (!todo.imageKey) {
    return null;
  }

  return getImageObject(todo.imageKey);
}

export async function replaceTodoImage(todo: TodoRow, image: File) {
  const previousImageKey = todo.imageKey;
  const imageKey = createImageObjectKey({
    prefix: "todo-images",
    ownerId: todo.userId,
    resourceId: todo.id,
    file: image,
  });

  await putImageObject({
    key: imageKey,
    file: image,
    customMetadata: {
      todoId: String(todo.id),
      userId: todo.userId,
      originalName: image.name,
    },
  });

  const [updatedTodo] = await db
    .update(todos)
    .set({
      imageKey,
      imageName: image.name,
      imageContentType: image.type,
      imageSize: image.size,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todo.id), eq(todos.userId, todo.userId)))
    .returning();

  if (!updatedTodo) {
    await deleteImageObject(imageKey);
    return null;
  }

  if (previousImageKey && previousImageKey !== imageKey) {
    await deleteTodoImageObject(previousImageKey);
  }

  return serializeTodoImage(updatedTodo);
}

export async function clearTodoImage(todo: TodoRow) {
  const previousImageKey = todo.imageKey;

  const [updatedTodo] = await db
    .update(todos)
    .set({
      imageKey: null,
      imageName: null,
      imageContentType: null,
      imageSize: null,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todo.id), eq(todos.userId, todo.userId)))
    .returning();

  if (!updatedTodo) {
    return undefined;
  }

  if (previousImageKey) {
    await deleteTodoImageObject(previousImageKey);
  }

  return null;
}

export async function deleteTodoImageObject(imageKey: string | null) {
  await deleteImageObjectSafely(imageKey, { logContext: { feature: "todo-image" } });
}

function serializeTodoImage(todo: TodoRow): TodoImage | null {
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
