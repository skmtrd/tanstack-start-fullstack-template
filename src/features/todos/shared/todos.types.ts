import {
  defaultImageUploadConfig,
  type UploadedImage,
} from "#/features/uploads/shared/image-upload.types";

export type TodoImage = UploadedImage;

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  image: TodoImage | null;
  createdAt: string | null;
  updatedAt: string;
};

export const todoKeys = {
  all: ["todos"] as const,
};

export const todoImageConfig = defaultImageUploadConfig;

export function todoImageEndpoint(todoId: number) {
  return `/api/todos/${todoId}/image`;
}

export function todoImageUrl(todoId: number, version: number) {
  return `${todoImageEndpoint(todoId)}?v=${version}`;
}
