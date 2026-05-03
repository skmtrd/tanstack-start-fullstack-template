import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Circle, Loader2, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { addTodo, deleteTodo, listTodos, updateTodo } from "#/features/todos/todos.functions";

const todoKeys = {
  all: ["todos"] as const,
};

export function TodoWorkspace() {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();
  const todosQuery = useQuery({
    queryKey: todoKeys.all,
    queryFn: () => listTodos(),
  });

  const stats = useMemo(() => {
    const todos = todosQuery.data ?? [];
    const completed = todos.filter((todo) => todo.completed).length;
    return { total: todos.length, completed, open: todos.length - completed };
  }, [todosQuery.data]);

  const addMutation = useMutation({
    mutationFn: (nextTitle: string) => addTodo({ data: { title: nextTitle } }),
    onSuccess: async () => {
      setTitle("");
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (todo: { id: number; completed: boolean }) => updateTodo({ data: todo }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });

  function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();

    if (nextTitle) {
      addMutation.mutate(nextTitle);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm">
        <p className="text-sm font-semibold text-[var(--lagoon-deep)]">Today</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Open" value={stats.open} />
          <Stat label="Done" value={stats.completed} />
          <Stat label="Total" value={stats.total} />
        </div>
      </aside>

      <div className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm">
        <form className="flex gap-3 border-b border-[var(--line)] p-4" onSubmit={handleAddTodo}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a todo"
            maxLength={160}
            disabled={addMutation.isPending}
            className="h-11"
          />
          <Button type="submit" size="lg" disabled={addMutation.isPending || !title.trim()}>
            {addMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            Add
          </Button>
        </form>

        <div className="min-h-[360px] p-3">
          {todosQuery.isPending ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2
                className="size-5 animate-spin text-[var(--lagoon-deep)]"
                aria-hidden="true"
              />
            </div>
          ) : todosQuery.isError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {todosQuery.error.message}
            </p>
          ) : todosQuery.data.length ? (
            <ul className="grid gap-2">
              {todosQuery.data.map((todo) => (
                <li
                  key={todo.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-[var(--line)] bg-white/70 p-3"
                >
                  <Button
                    type="button"
                    variant={todo.completed ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() =>
                      updateMutation.mutate({ id: todo.id, completed: !todo.completed })
                    }
                    disabled={updateMutation.isPending}
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
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteMutation.mutate(todo.id)}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete todo"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-[var(--line)] text-sm text-[var(--sea-ink-soft)]">
              No todos yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] p-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold text-[var(--sea-ink-soft)]">{label}</p>
    </div>
  );
}
