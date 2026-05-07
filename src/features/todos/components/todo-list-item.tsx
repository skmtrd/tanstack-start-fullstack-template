import { Check, Circle, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

import { Button } from "#/components/ui/button";
import { todoImageConfig, type Todo } from "#/features/todos/shared/todos.types";
import { cn } from "#/lib/utils";

type TodoListItemProps = {
  todo: Todo;
  isOptimistic: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  isImagePending: boolean;
  isImageUploading: boolean;
  isImageRemoving: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAttachImage: (file: File) => void;
  onRemoveImage: () => void;
};

export function TodoListItem({
  todo,
  isOptimistic,
  isUpdatePending,
  isDeletePending,
  isImagePending,
  isImageUploading,
  isImageRemoving,
  onToggle,
  onDelete,
  onAttachImage,
  onRemoveImage,
}: TodoListItemProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const itemDisabled = isOptimistic;

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (file) {
      onAttachImage(file);
    }
  }

  return (
    <li
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-md border border-[var(--line)] bg-white/70 p-3",
        isOptimistic && "opacity-70",
      )}
    >
      <Button
        type="button"
        variant={todo.completed ? "default" : "outline"}
        size="icon-sm"
        onClick={onToggle}
        disabled={isUpdatePending || itemDisabled}
        aria-label={todo.completed ? "Mark open" : "Mark complete"}
      >
        {todo.completed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
      </Button>

      <div className="min-w-0">
        <p
          className={
            todo.completed
              ? "break-words text-sm font-medium text-[var(--sea-ink-soft)] line-through"
              : "break-words text-sm font-medium"
          }
        >
          {todo.title}
        </p>
        <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(todo.createdAt ?? todo.updatedAt))}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {todo.image ? (
            <img
              src={todo.image.url}
              alt={todo.image.name ?? "Todo attachment"}
              className="size-20 rounded-md border border-[var(--line)] bg-[var(--chip-bg)] object-cover"
            />
          ) : null}

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={todoImageConfig.accept}
              className="sr-only"
              disabled={isImagePending || itemDisabled}
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isImagePending || itemDisabled}
              onClick={() => fileInputRef.current?.click()}
            >
              {isImageUploading ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus aria-hidden="true" />
              )}
              {todo.image ? "Replace" : "Attach image"}
            </Button>
            {todo.image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isImagePending || itemDisabled}
                onClick={onRemoveImage}
              >
                {isImageRemoving ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <X aria-hidden="true" />
                )}
                Remove
              </Button>
            ) : null}
            {todo.image?.name ? (
              <p className="max-w-48 truncate text-xs text-[var(--sea-ink-soft)]">
                {todo.image.name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        disabled={isDeletePending || itemDisabled}
        aria-label="Delete todo"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  );
}
