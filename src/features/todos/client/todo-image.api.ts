import { todoImageConfig, todoImageEndpoint } from "#/features/todos/shared/todos.types";

async function responseError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function uploadTodoImage({ todoId, file }: { todoId: number; file: File }) {
  const formData = new FormData();
  formData.set(todoImageConfig.fieldName, file);

  const response = await fetch(todoImageEndpoint(todoId), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await responseError(response, "Image could not be attached"));
  }
}

export async function removeTodoImage(todoId: number) {
  const response = await fetch(todoImageEndpoint(todoId), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await responseError(response, "Image could not be removed"));
  }
}
