import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "#/db";
import { todos } from "#/db/schema";
import { serializeTodo } from "#/features/todos/server/todos.serializers.server";
import { deleteImageObjectSafely } from "#/features/uploads/server/r2-object.server";
import { auth } from "#/features/auth/server/auth.server";

const addTodoSchema = z.object({
  title: z.string().trim().min(1).max(160),
});

const updateTodoSchema = z.object({
  id: z.number().int().positive(),
  completed: z.boolean(),
});

const deleteTodoSchema = z.object({
  id: z.number().int().positive(),
});

async function requireSession() {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    asResponse: false,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export const listTodos = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();

  const rows = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(desc(todos.createdAt));

  return rows.map(serializeTodo);
});

export const addTodo = createServerFn({ method: "POST" })
  .inputValidator(addTodoSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();

    const [todo] = await db
      .insert(todos)
      .values({
        title: data.title,
        userId: session.user.id,
      })
      .returning();

    if (!todo) {
      throw new Error("Todo could not be created");
    }

    return serializeTodo(todo);
  });

export const updateTodo = createServerFn({ method: "POST" })
  .inputValidator(updateTodoSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();

    const [todo] = await db
      .update(todos)
      .set({ completed: data.completed })
      .where(and(eq(todos.id, data.id), eq(todos.userId, session.user.id)))
      .returning();

    if (!todo) {
      throw new Error("Todo not found");
    }

    return serializeTodo(todo);
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(deleteTodoSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();

    const [todo] = await db
      .delete(todos)
      .where(and(eq(todos.id, data.id), eq(todos.userId, session.user.id)))
      .returning({ id: todos.id, imageKey: todos.imageKey });

    if (!todo) {
      throw new Error("Todo not found");
    }

    await deleteTodoImageObject(todo.imageKey);

    return { id: todo.id };
  });

async function deleteTodoImageObject(imageKey: string | null) {
  await deleteImageObjectSafely(imageKey, { logContext: { feature: "todo-delete" } });
}
