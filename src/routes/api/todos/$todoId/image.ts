import { createFileRoute } from "@tanstack/react-router";

import {
  clearTodoImage,
  findUserTodo,
  getTodoImage,
  parseTodoIdParam,
  parseTodoImageFile,
  replaceTodoImage,
} from "./-image.server";
import { todoImageConfig } from "#/features/todos/shared/todos.types";
import { auth } from "#/features/auth/server/auth.server";

type ImageRouteParams = {
  todoId: string;
};

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

async function requireImageRouteTodo(request: Request, params: ImageRouteParams) {
  const session = await auth.api.getSession({
    headers: request.headers,
    asResponse: false,
  });

  if (!session) {
    return { response: jsonError("Unauthorized", 401) };
  }

  const todoId = parseTodoIdParam(params.todoId);

  if (!todoId) {
    return { response: jsonError("Invalid todo id", 400) };
  }

  const todo = await findUserTodo(todoId, session.user.id);

  if (!todo) {
    return { response: jsonError("Todo not found", 404) };
  }

  return { todo };
}

export const Route = createFileRoute("/api/todos/$todoId/image")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const result = await requireImageRouteTodo(request, params);

        if ("response" in result) {
          return result.response;
        }

        const object = await getTodoImage(result.todo);

        if (!object) {
          return jsonError("Image not found", 404);
        }

        const headers = new Headers();
        headers.set(
          "content-type",
          result.todo.imageContentType ??
            object.httpMetadata?.contentType ??
            "application/octet-stream",
        );
        headers.set("content-length", String(object.size));
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "private, max-age=300");

        return new Response(object.body, { headers });
      },
      POST: async ({ request, params }) => {
        const result = await requireImageRouteTodo(request, params);

        if ("response" in result) {
          return result.response;
        }

        const formData = await request.formData();
        const image = formData.get(todoImageConfig.fieldName);
        const parsedImage = parseTodoImageFile(image);

        if ("error" in parsedImage) {
          return jsonError(parsedImage.error.message, parsedImage.error.status);
        }

        const nextImage = await replaceTodoImage(result.todo, parsedImage.file);

        if (!nextImage) {
          return jsonError("Todo not found", 404);
        }

        return Response.json({ image: nextImage });
      },
      DELETE: async ({ request, params }) => {
        const result = await requireImageRouteTodo(request, params);

        if ("response" in result) {
          return result.response;
        }

        const nextImage = await clearTodoImage(result.todo);

        if (nextImage === undefined) {
          return jsonError("Todo not found", 404);
        }

        return Response.json({ image: nextImage });
      },
    },
  },
});
